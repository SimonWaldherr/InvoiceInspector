// InvoiceInspector Sync Server is an optional, self-hosted store for local
// collection backups. It does not parse or index individual invoice fields.
package main

import (
	"bytes"
	"crypto/sha256"
	"crypto/subtle"
	"encoding/hex"
	"encoding/json"
	"errors"
	"flag"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"sync"
	"time"
)

const (
	maxBackupBytes int64 = 25 << 20 // 25 MiB
	maxPDFBytes    int64 = 50 << 20 // 50 MiB per invoice attachment
)

type storageMode string

const (
	storageFull storageMode = "full" // Store the exact JSON backup sent by the browser.
	storageData storageMode = "data" // Store only the invoices array, not envelope metadata.
)

type syncUser struct {
	ID        string
	Token     string
	Workspace string
}

type usersConfig struct {
	Users []syncUser
}

// serverConfig is intentionally small enough to be used directly as a JSON
// configuration file for a self-hosted deployment.
type serverConfig struct {
	Address       string
	DataDir       string
	AllowedOrigin string
	StorageMode   string
	PDFSync       *bool
	Users         []syncUser
}

type backupEnvelope struct {
	Format   string
	Version  int
	Invoices json.RawMessage
}

type storedData struct {
	Invoices json.RawMessage
}

type syncServer struct {
	users         []syncUser
	dataDir       string
	mode          storageMode
	pdfSync       bool
	allowedOrigin string
	locks         sync.Map // map[workspace]*sync.Mutex
}

func newSyncServer(token, dataDir, allowedOrigin string) (*syncServer, error) {
	return newConfiguredSyncServer([]syncUser{{ID: "default", Token: token, Workspace: "default"}}, dataDir, allowedOrigin, storageFull)
}

func newConfiguredSyncServer(users []syncUser, dataDir, allowedOrigin string, mode storageMode) (*syncServer, error) {
	return newConfiguredSyncServerWithPDF(users, dataDir, allowedOrigin, mode, true)
}

func newConfiguredSyncServerWithPDF(users []syncUser, dataDir, allowedOrigin string, mode storageMode, pdfSync bool) (*syncServer, error) {
	if mode != storageFull && mode != storageData {
		return nil, fmt.Errorf("storage mode must be %q or %q", storageFull, storageData)
	}
	if len(users) == 0 {
		return nil, errors.New("at least one sync user is required")
	}
	seenIDs, seenTokens := map[string]bool{}, map[string]bool{}
	for i := range users {
		users[i].ID = strings.TrimSpace(users[i].ID)
		users[i].Token = strings.TrimSpace(users[i].Token)
		users[i].Workspace = strings.TrimSpace(users[i].Workspace)
		if users[i].ID == "" || users[i].Workspace == "" || len(users[i].Token) < 24 {
			return nil, errors.New("every user needs an id, workspace and token of at least 24 characters")
		}
		if seenIDs[users[i].ID] || seenTokens[users[i].Token] {
			return nil, errors.New("user IDs and tokens must be unique")
		}
		seenIDs[users[i].ID], seenTokens[users[i].Token] = true, true
	}
	if err := os.MkdirAll(dataDir, 0o700); err != nil {
		return nil, fmt.Errorf("create data directory: %w", err)
	}
	return &syncServer{users: users, dataDir: dataDir, mode: mode, pdfSync: pdfSync, allowedOrigin: allowedOrigin}, nil
}

func (s *syncServer) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	s.applyCORS(w, r)
	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusNoContent)
		return
	}
	if r.URL.Path == "/healthz" {
		if r.Method != http.MethodGet {
			methodNotAllowed(w, http.MethodGet)
			return
		}
		w.Header().Set("Cache-Control", "no-store")
		w.WriteHeader(http.StatusNoContent)
		return
	}
	fileID, isFileRequest := attachmentID(r.URL.Path)
	if r.URL.Path != "/v1/backup" && r.URL.Path != "/v1/config" && !isFileRequest {
		http.NotFound(w, r)
		return
	}
	user, ok := s.authorized(r)
	if !ok {
		w.Header().Set("WWW-Authenticate", "Bearer")
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}
	if r.URL.Path == "/v1/config" {
		if r.Method != http.MethodGet {
			methodNotAllowed(w, http.MethodGet)
			return
		}
		s.getConfig(w)
		return
	}
	if isFileRequest {
		if !s.pdfSync {
			http.NotFound(w, r)
			return
		}
		switch r.Method {
		case http.MethodGet:
			s.getPDF(w, r, user, fileID)
		case http.MethodPut:
			s.putPDF(w, r, user, fileID)
		default:
			methodNotAllowed(w, http.MethodGet+", "+http.MethodPut)
		}
		return
	}
	switch r.Method {
	case http.MethodGet:
		s.getBackup(w, r, user)
	case http.MethodPut:
		s.putBackup(w, r, user)
	default:
		methodNotAllowed(w, http.MethodGet+", "+http.MethodPut)
	}
}

func (s *syncServer) getConfig(w http.ResponseWriter) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.Header().Set("Cache-Control", "no-store")
	_ = json.NewEncoder(w).Encode(map[string]any{
		"storageMode": s.mode, "pdfSync": s.pdfSync,
		"maxBackupBytes": maxBackupBytes, "maxPDFBytes": maxPDFBytes,
	})
}

func attachmentID(path string) (string, bool) {
	const prefix = "/v1/files/"
	if !strings.HasPrefix(path, prefix) {
		return "", false
	}
	id := strings.TrimPrefix(path, prefix)
	if id == "" || len(id) > 200 || strings.Contains(id, "/") {
		return "", false
	}
	return id, true
}

func (s *syncServer) applyCORS(w http.ResponseWriter, r *http.Request) {
	origin := r.Header.Get("Origin")
	if origin == "" || (s.allowedOrigin != "*" && origin != s.allowedOrigin) {
		return
	}
	w.Header().Set("Access-Control-Allow-Origin", s.allowedOrigin)
	w.Header().Set("Access-Control-Allow-Methods", "GET, PUT, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Authorization, Content-Type, If-Match")
	w.Header().Set("Access-Control-Expose-Headers", "ETag")
	w.Header().Set("Vary", "Origin")
}

func (s *syncServer) authorized(r *http.Request) (syncUser, bool) {
	parts := strings.Fields(r.Header.Get("Authorization"))
	if len(parts) != 2 || !strings.EqualFold(parts[0], "Bearer") {
		return syncUser{}, false
	}
	for _, user := range s.users {
		if len(parts[1]) == len(user.Token) && subtle.ConstantTimeCompare([]byte(parts[1]), []byte(user.Token)) == 1 {
			return user, true
		}
	}
	return syncUser{}, false
}

func (s *syncServer) getBackup(w http.ResponseWriter, r *http.Request, user syncUser) {
	lock := s.workspaceLock(user.Workspace)
	lock.Lock()
	data, err := os.ReadFile(s.workspacePath(user.Workspace))
	lock.Unlock()
	if errors.Is(err, os.ErrNotExist) {
		http.Error(w, "backup not found", http.StatusNotFound)
		return
	}
	if err != nil {
		http.Error(w, "backup unavailable", http.StatusInternalServerError)
		return
	}
	etag := quoteETag(data)
	if r.Header.Get("If-None-Match") == etag {
		w.Header().Set("ETag", etag)
		w.WriteHeader(http.StatusNotModified)
		return
	}
	response, err := s.responseBackup(data)
	if err != nil {
		http.Error(w, "stored backup is invalid", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.Header().Set("X-Content-Type-Options", "nosniff")
	w.Header().Set("Cache-Control", "no-store")
	w.Header().Set("ETag", etag)
	_, _ = w.Write(response)
}

func (s *syncServer) putBackup(w http.ResponseWriter, r *http.Request, user syncUser) {
	body := http.MaxBytesReader(w, r.Body, maxBackupBytes)
	defer body.Close()
	input, err := io.ReadAll(body)
	if err != nil || len(input) == 0 {
		http.Error(w, "a non-empty JSON backup up to 25 MiB is required", http.StatusBadRequest)
		return
	}
	data, err := s.storageBackup(input)
	if err != nil {
		http.Error(w, "a valid InvoiceInspector backup is required", http.StatusBadRequest)
		return
	}
	lock := s.workspaceLock(user.Workspace)
	lock.Lock()
	defer lock.Unlock()
	path := s.workspacePath(user.Workspace)
	current, readErr := os.ReadFile(path)
	if expected := r.Header.Get("If-Match"); expected != "" {
		if readErr != nil || expected != quoteETag(current) {
			http.Error(w, "backup changed", http.StatusPreconditionFailed)
			return
		}
	} else if readErr == nil {
		// A client that has not downloaded the existing workspace must not
		// overwrite another employee's current collection.
		http.Error(w, "backup changed", http.StatusPreconditionFailed)
		return
	} else if !errors.Is(readErr, os.ErrNotExist) {
		http.Error(w, "backup unavailable", http.StatusInternalServerError)
		return
	}
	if err := atomicWrite(path, data); err != nil {
		http.Error(w, "backup could not be stored", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Cache-Control", "no-store")
	w.Header().Set("ETag", quoteETag(data))
	w.WriteHeader(http.StatusNoContent)
}

func (s *syncServer) getPDF(w http.ResponseWriter, r *http.Request, user syncUser, fileID string) {
	lock := s.workspaceLock(user.Workspace)
	lock.Lock()
	data, err := os.ReadFile(s.attachmentPath(user.Workspace, fileID))
	lock.Unlock()
	if errors.Is(err, os.ErrNotExist) {
		http.Error(w, "PDF not found", http.StatusNotFound)
		return
	}
	if err != nil {
		http.Error(w, "PDF unavailable", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/pdf")
	w.Header().Set("X-Content-Type-Options", "nosniff")
	w.Header().Set("Cache-Control", "no-store")
	w.Header().Set("ETag", quoteETag(data))
	_, _ = w.Write(data)
}

func (s *syncServer) putPDF(w http.ResponseWriter, r *http.Request, user syncUser, fileID string) {
	body := http.MaxBytesReader(w, r.Body, maxPDFBytes)
	defer body.Close()
	data, err := io.ReadAll(body)
	if err != nil || len(data) < 5 || !bytes.Equal(data[:5], []byte("%PDF-")) {
		http.Error(w, "a PDF up to 50 MiB is required", http.StatusBadRequest)
		return
	}
	lock := s.workspaceLock(user.Workspace)
	lock.Lock()
	defer lock.Unlock()
	path := s.attachmentPath(user.Workspace, fileID)
	if existing, readErr := os.ReadFile(path); readErr == nil {
		if quoteETag(existing) != quoteETag(data) {
			http.Error(w, "a different PDF is already stored for this invoice", http.StatusConflict)
			return
		}
		w.Header().Set("ETag", quoteETag(existing))
		w.WriteHeader(http.StatusNoContent)
		return
	} else if !errors.Is(readErr, os.ErrNotExist) {
		http.Error(w, "PDF unavailable", http.StatusInternalServerError)
		return
	}
	if err := atomicWrite(path, data); err != nil {
		http.Error(w, "PDF could not be stored", http.StatusInternalServerError)
		return
	}
	w.Header().Set("ETag", quoteETag(data))
	w.WriteHeader(http.StatusNoContent)
}

func (s *syncServer) storageBackup(input []byte) ([]byte, error) {
	var envelope backupEnvelope
	if !json.Valid(input) || json.Unmarshal(input, &envelope) != nil || envelope.Format != "InvoiceInspector collection backup" || envelope.Version != 1 || !isJSONArray(envelope.Invoices) {
		return nil, errors.New("invalid backup")
	}
	if s.mode == storageFull {
		return input, nil
	}
	return json.Marshal(map[string]json.RawMessage{"invoices": envelope.Invoices})
}

func (s *syncServer) responseBackup(data []byte) ([]byte, error) {
	if s.mode == storageFull {
		if _, err := s.storageBackup(data); err != nil {
			return nil, err
		}
		return data, nil
	}
	var stored storedData
	if json.Unmarshal(data, &stored) != nil || !isJSONArray(stored.Invoices) {
		return nil, errors.New("invalid stored data")
	}
	return json.Marshal(map[string]any{
		"format": "InvoiceInspector collection backup", "version": 1, "invoices": stored.Invoices,
	})
}

func isJSONArray(value json.RawMessage) bool {
	var entries []json.RawMessage
	return len(value) > 0 && json.Unmarshal(value, &entries) == nil && entries != nil
}

func (s *syncServer) workspacePath(workspace string) string {
	sum := sha256.Sum256([]byte(workspace))
	return filepath.Join(s.dataDir, hex.EncodeToString(sum[:]), "collection-backup.json")
}

func (s *syncServer) attachmentPath(workspace, fileID string) string {
	workspaceSum := sha256.Sum256([]byte(workspace))
	fileSum := sha256.Sum256([]byte(fileID))
	return filepath.Join(s.dataDir, hex.EncodeToString(workspaceSum[:]), "pdf", hex.EncodeToString(fileSum[:])+".pdf")
}

func (s *syncServer) workspaceLock(workspace string) *sync.Mutex {
	lock, _ := s.locks.LoadOrStore(workspace, &sync.Mutex{})
	return lock.(*sync.Mutex)
}

func atomicWrite(path string, data []byte) error {
	if err := os.MkdirAll(filepath.Dir(path), 0o700); err != nil {
		return err
	}
	tmp, err := os.CreateTemp(filepath.Dir(path), ".collection-backup-*")
	if err != nil {
		return err
	}
	tmpName := tmp.Name()
	defer os.Remove(tmpName)
	if err := tmp.Chmod(0o600); err != nil {
		tmp.Close()
		return err
	}
	if _, err := tmp.Write(data); err != nil {
		tmp.Close()
		return err
	}
	if err := tmp.Sync(); err != nil {
		tmp.Close()
		return err
	}
	if err := tmp.Close(); err != nil {
		return err
	}
	return os.Rename(tmpName, path)
}

func quoteETag(data []byte) string {
	digest := sha256.Sum256(data)
	return fmt.Sprintf("\"%x\"", digest)
}

func methodNotAllowed(w http.ResponseWriter, allow string) {
	w.Header().Set("Allow", allow)
	http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
}

func loadUsers(path string) ([]syncUser, error) {
	data, err := os.ReadFile(path)
	if err != nil {
		return nil, err
	}
	var config usersConfig
	if err := json.Unmarshal(data, &config); err != nil {
		return nil, fmt.Errorf("parse users file: %w", err)
	}
	return config.Users, nil
}

func loadServerConfig(path string) (serverConfig, error) {
	data, err := os.ReadFile(path)
	if err != nil {
		return serverConfig{}, err
	}
	var config serverConfig
	if err := json.Unmarshal(data, &config); err != nil {
		return serverConfig{}, fmt.Errorf("parse server config: %w", err)
	}
	return config, nil
}

func main() {
	configFile := flag.String("config", os.Getenv("INVOICEINSPECTOR_SYNC_CONFIG"), "JSON server configuration file")
	addr := flag.String("addr", "", "listen address")
	dataDir := flag.String("data-dir", "", "directory for workspace backups")
	allowedOrigin := flag.String("allowed-origin", "", "allowed browser Origin, or *")
	mode := flag.String("storage-mode", "", "backup storage mode: full or data")
	pdfSync := flag.String("pdf-sync", "", "enable PDF attachment sync: true or false")
	usersFile := flag.String("users-file", os.Getenv("INVOICEINSPECTOR_SYNC_USERS_FILE"), "JSON file containing users and workspaces")
	flag.Parse()

	var config serverConfig
	var err error
	if *configFile != "" {
		config, err = loadServerConfig(*configFile)
		if err != nil {
			log.Fatal(err)
		}
	}
	var users []syncUser
	if len(config.Users) > 0 {
		users = config.Users
	} else if *usersFile != "" {
		users, err = loadUsers(*usersFile)
		if err != nil {
			log.Fatal(err)
		}
	} else {
		users = []syncUser{{ID: "default", Token: os.Getenv("INVOICEINSPECTOR_SYNC_TOKEN"), Workspace: "default"}}
	}
	resolvedAddr := firstNonEmpty(*addr, os.Getenv("INVOICEINSPECTOR_SYNC_ADDR"), config.Address, "127.0.0.1:8787")
	resolvedDataDir := firstNonEmpty(*dataDir, os.Getenv("INVOICEINSPECTOR_SYNC_DATA_DIR"), config.DataDir, "./data")
	resolvedOrigin := firstNonEmpty(*allowedOrigin, os.Getenv("INVOICEINSPECTOR_SYNC_ALLOWED_ORIGIN"), config.AllowedOrigin, "*")
	resolvedMode := firstNonEmpty(*mode, os.Getenv("INVOICEINSPECTOR_SYNC_STORAGE_MODE"), config.StorageMode, string(storageFull))
	resolvedPDFSync, err := resolveBool(firstNonEmpty(*pdfSync, os.Getenv("INVOICEINSPECTOR_SYNC_PDF_SYNC")), config.PDFSync, true)
	if err != nil {
		log.Fatal(err)
	}
	server, err := newConfiguredSyncServerWithPDF(users, resolvedDataDir, resolvedOrigin, storageMode(resolvedMode), resolvedPDFSync)
	if err != nil {
		log.Fatal(err)
	}
	httpServer := &http.Server{
		Addr:              resolvedAddr,
		Handler:           server,
		ReadHeaderTimeout: 5 * time.Second,
		ReadTimeout:       30 * time.Second,
		WriteTimeout:      30 * time.Second,
		IdleTimeout:       60 * time.Second,
	}
	log.Printf("InvoiceInspector sync server listening on %s (%d users, %s storage, PDF sync: %t)", resolvedAddr, len(users), resolvedMode, resolvedPDFSync)
	log.Fatal(httpServer.ListenAndServe())
}

func firstNonEmpty(values ...string) string {
	for _, value := range values {
		if value != "" {
			return value
		}
	}
	return ""
}

func resolveBool(value string, configured *bool, fallback bool) (bool, error) {
	if value == "" {
		if configured != nil {
			return *configured, nil
		}
		return fallback, nil
	}
	switch strings.ToLower(value) {
	case "1", "true", "yes", "on":
		return true, nil
	case "0", "false", "no", "off":
		return false, nil
	default:
		return false, fmt.Errorf("boolean setting must be true or false")
	}
}

func envOr(key, fallback string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return fallback
}
