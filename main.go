package main

import (
	"encoding/json"
	"io/ioutil"
	"log"
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
)

func main() {
	r := chi.NewRouter()
	r.Use(middleware.RequestID)
	r.Use(middleware.RealIP)
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(middleware.Timeout(30 * time.Second))

	r.Handle("/components/*", http.FileServer(http.Dir(".")))
	r.Get("/folders", func(w http.ResponseWriter, r *http.Request) {
		folders := getFolderNames()
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(folders)
	})
	r.Handle("/*", http.FileServer(http.Dir("./pages")))

	http.ListenAndServe(":8000", r)
}

func getFolderNames() []string {
	var folders []string
	files, err := ioutil.ReadDir("./pages")
	if err != nil {
		log.Fatal(err)
	}
	for _, file := range files {
		if file.IsDir() {
			folders = append(folders, file.Name())
		}
	}
	return folders
}
