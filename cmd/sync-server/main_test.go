package main

import (
	"net/http"
	"net/http/httptest"
	"os"
	"strings"
	"testing"
)

const testToken = "a-long-random-test-token-that-is-at-least-24-chars"

func TestBackupRequiresTokenAndSupportsConditionalWrites(t *testing.T) {
	server, err := newSyncServer(testToken, t.TempDir(), "https://viewer.example")
	if err != nil {
		t.Fatal(err)
	}
	h := server
	put := func(token, etag, body string) *httptest.ResponseRecorder {
		r := httptest.NewRequest(http.MethodPut, "/v1/backup", strings.NewReader(body))
		r.Header.Set("Authorization", "Bearer "+token)
		if etag != "" {
			r.Header.Set("If-Match", etag)
		}
		w := httptest.NewRecorder()
		h.ServeHTTP(w, r)
		return w
	}
	if got := put("wrong", "", `{}`).Code; got != http.StatusUnauthorized {
		t.Fatalf("unauthorized PUT = %d", got)
	}
	first := put(testToken, "", `{"format":"InvoiceInspector collection backup","version":1,"invoices":[]}`)
	if first.Code != http.StatusNoContent {
		t.Fatalf("initial PUT = %d: %s", first.Code, first.Body.String())
	}
	etag := first.Header().Get("ETag")
	if etag == "" {
		t.Fatal("missing ETag")
	}
	if got := put(testToken, "", `{"format":"InvoiceInspector collection backup","version":1,"invoices":[]}`).Code; got != http.StatusPreconditionFailed {
		t.Fatalf("unconditional overwrite = %d", got)
	}
	if got := put(testToken, "\"outdated\"", `{"format":"InvoiceInspector collection backup","version":1,"invoices":[]}`).Code; got != http.StatusPreconditionFailed {
		t.Fatalf("conditional PUT = %d", got)
	}
	get := httptest.NewRequest(http.MethodGet, "/v1/backup", nil)
	get.Header.Set("Authorization", "Bearer "+testToken)
	get.Header.Set("Origin", "https://viewer.example")
	got := httptest.NewRecorder()
	h.ServeHTTP(got, get)
	if got.Code != http.StatusOK || got.Body.String() != `{"format":"InvoiceInspector collection backup","version":1,"invoices":[]}` {
		t.Fatalf("GET = %d: %s", got.Code, got.Body.String())
	}
	if got.Header().Get("Access-Control-Allow-Origin") != "https://viewer.example" {
		t.Fatal("expected configured CORS origin")
	}
	if got.Header().Get("ETag") != etag {
		t.Fatal("GET ETag differs from PUT ETag")
	}
}

func TestBackupRejectsMalformedJSON(t *testing.T) {
	server, err := newSyncServer(testToken, t.TempDir(), "*")
	if err != nil {
		t.Fatal(err)
	}
	r := httptest.NewRequest(http.MethodPut, "/v1/backup", strings.NewReader(`{`))
	r.Header.Set("Authorization", "Bearer "+testToken)
	w := httptest.NewRecorder()
	server.ServeHTTP(w, r)
	if w.Code != http.StatusBadRequest {
		t.Fatalf("malformed backup = %d", w.Code)
	}
}

func TestUsersShareWorkspaceButCannotReadOtherWorkspaces(t *testing.T) {
	users := []syncUser{
		{ID: "alice", Token: "alice-token-that-is-long-enough-0001", Workspace: "finance"},
		{ID: "bob", Token: "bob-token-that-is-long-enough-0000002", Workspace: "finance"},
		{ID: "carol", Token: "carol-token-that-is-long-enough-0003", Workspace: "other"},
	}
	server, err := newConfiguredSyncServer(users, t.TempDir(), "*", storageFull)
	if err != nil {
		t.Fatal(err)
	}
	request := func(method, token, body string) *httptest.ResponseRecorder {
		r := httptest.NewRequest(method, "/v1/backup", strings.NewReader(body))
		r.Header.Set("Authorization", "Bearer "+token)
		w := httptest.NewRecorder()
		server.ServeHTTP(w, r)
		return w
	}
	backup := `{"format":"InvoiceInspector collection backup","version":1,"invoices":[{"header":{"number":"A-1"}}]}`
	if got := request(http.MethodPut, users[0].Token, backup).Code; got != http.StatusNoContent {
		t.Fatalf("alice PUT = %d", got)
	}
	if got := request(http.MethodGet, users[1].Token, ""); got.Code != http.StatusOK || got.Body.String() != backup {
		t.Fatalf("bob shared GET = %d: %s", got.Code, got.Body.String())
	}
	if got := request(http.MethodGet, users[2].Token, "").Code; got != http.StatusNotFound {
		t.Fatalf("carol isolated GET = %d", got)
	}
}

func TestDataModeStoresOnlyInvoicesArray(t *testing.T) {
	user := syncUser{ID: "alice", Token: "alice-token-that-is-long-enough-0001", Workspace: "finance"}
	server, err := newConfiguredSyncServer([]syncUser{user}, t.TempDir(), "*", storageData)
	if err != nil {
		t.Fatal(err)
	}
	backup := `{"format":"InvoiceInspector collection backup","version":1,"exportedAt":"2026-09-05T00:00:00Z","invoices":[{"header":{"number":"A-1"}}]}`
	put := httptest.NewRequest(http.MethodPut, "/v1/backup", strings.NewReader(backup))
	put.Header.Set("Authorization", "Bearer "+user.Token)
	w := httptest.NewRecorder()
	server.ServeHTTP(w, put)
	if w.Code != http.StatusNoContent {
		t.Fatalf("data mode PUT = %d: %s", w.Code, w.Body.String())
	}
	stored, err := os.ReadFile(server.workspacePath(user.Workspace))
	if err != nil {
		t.Fatal(err)
	}
	if strings.Contains(string(stored), "exportedAt") || !strings.Contains(string(stored), `"invoices"`) {
		t.Fatalf("data mode stored unexpected content: %s", stored)
	}
	get := httptest.NewRequest(http.MethodGet, "/v1/backup", nil)
	get.Header.Set("Authorization", "Bearer "+user.Token)
	got := httptest.NewRecorder()
	server.ServeHTTP(got, get)
	if got.Code != http.StatusOK || !strings.Contains(got.Body.String(), `"format":"InvoiceInspector collection backup"`) || !strings.Contains(got.Body.String(), `"number":"A-1"`) {
		t.Fatalf("data mode GET = %d: %s", got.Code, got.Body.String())
	}
}

func TestLoadUsersAcceptsDocumentedJSONShape(t *testing.T) {
	path := t.TempDir() + "/users.json"
	content := `{"users":[{"id":"anna","token":"anna-token-that-is-long-enough-0001","workspace":"finance"}]}`
	if err := os.WriteFile(path, []byte(content), 0o600); err != nil {
		t.Fatal(err)
	}
	users, err := loadUsers(path)
	if err != nil || len(users) != 1 || users[0].ID != "anna" || users[0].Workspace != "finance" {
		t.Fatalf("loadUsers = %#v, %v", users, err)
	}
}

func TestLoadServerConfigAndExposeCapabilities(t *testing.T) {
	path := t.TempDir() + "/sync-server.json"
	content := `{"address":"127.0.0.1:9000","storageMode":"data","pdfSync":false,"users":[{"id":"anna","token":"anna-token-that-is-long-enough-0001","workspace":"finance"}]}`
	if err := os.WriteFile(path, []byte(content), 0o600); err != nil {
		t.Fatal(err)
	}
	config, err := loadServerConfig(path)
	if err != nil || config.StorageMode != "data" || config.PDFSync == nil || *config.PDFSync || len(config.Users) != 1 {
		t.Fatalf("loadServerConfig = %#v, %v", config, err)
	}
	server, err := newConfiguredSyncServerWithPDF(config.Users, t.TempDir(), "*", storageData, *config.PDFSync)
	if err != nil {
		t.Fatal(err)
	}
	req := httptest.NewRequest(http.MethodGet, "/v1/config", nil)
	req.Header.Set("Authorization", "Bearer "+config.Users[0].Token)
	res := httptest.NewRecorder()
	server.ServeHTTP(res, req)
	if res.Code != http.StatusOK || !strings.Contains(res.Body.String(), `"storageMode":"data"`) || !strings.Contains(res.Body.String(), `"pdfSync":false`) {
		t.Fatalf("config endpoint = %d: %s", res.Code, res.Body.String())
	}
}

func TestPDFAttachmentsAreSharedAndImmutable(t *testing.T) {
	users := []syncUser{
		{ID: "alice", Token: "alice-token-that-is-long-enough-0001", Workspace: "finance"},
		{ID: "bob", Token: "bob-token-that-is-long-enough-0000002", Workspace: "finance"},
	}
	server, err := newConfiguredSyncServer(users, t.TempDir(), "*", storageFull)
	if err != nil {
		t.Fatal(err)
	}
	request := func(method, token, body string) *httptest.ResponseRecorder {
		r := httptest.NewRequest(method, "/v1/files/invoice-123", strings.NewReader(body))
		r.Header.Set("Authorization", "Bearer "+token)
		w := httptest.NewRecorder()
		server.ServeHTTP(w, r)
		return w
	}
	pdf := "%PDF-1.7\nminimal test PDF"
	if got := request(http.MethodPut, users[0].Token, pdf).Code; got != http.StatusNoContent {
		t.Fatalf("PDF PUT = %d", got)
	}
	if got := request(http.MethodPut, users[1].Token, pdf).Code; got != http.StatusNoContent {
		t.Fatalf("idempotent PDF PUT = %d", got)
	}
	if got := request(http.MethodPut, users[1].Token, "%PDF-1.7\ndifferent").Code; got != http.StatusConflict {
		t.Fatalf("conflicting PDF PUT = %d", got)
	}
	response := request(http.MethodGet, users[1].Token, "")
	if response.Code != http.StatusOK || response.Body.String() != pdf || response.Header().Get("Content-Type") != "application/pdf" {
		t.Fatalf("PDF GET = %d: %s", response.Code, response.Body.String())
	}
}
