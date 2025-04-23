package main

import (
	"encoding/json"
	"html/template"
	"log"
	"net/http"
)

// Define a structure for saving quiz progress
type Progress struct {
	UserID string `json:"userId"`
	Score  int    `json:"score"`
}

var progressStore = make(map[string]Progress)

func mainPage(w http.ResponseWriter, r *http.Request) {
	tmpl := template.Must(template.ParseFiles("templates/index.html"))
	tmpl.Execute(w, nil)
}

// API to save progress
func saveProgress(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Only POST allowed", http.StatusMethodNotAllowed)
		return
	}

	var p Progress
	if err := json.NewDecoder(r.Body).Decode(&p); err != nil {
		http.Error(w, "Invalid data", http.StatusBadRequest)
		return
	}

	progressStore[p.UserID] = p
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]string{"status": "saved"})
}

// API to get progress
func getProgress(w http.ResponseWriter, r *http.Request) {
	userID := r.URL.Query().Get("userId")
	progress, ok := progressStore[userID]
	if !ok {
		http.Error(w, "Not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(progress)
}

func main() {
	// Serve static assets
	http.Handle("/static/", http.StripPrefix("/static/", http.FileServer(http.Dir("static"))))

	// Template handler
	http.HandleFunc("/", mainPage)

	// API routes
	http.HandleFunc("/save", saveProgress)
	http.HandleFunc("/get", getProgress)

	log.Println("Server running at http://localhost:8080/")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
