package main

import (
	"encoding/json"
	"io/ioutil"
	"log"
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool { return true },
}

var daddy *websocket.Conn
var baby *websocket.Conn

func main() {
	r := chi.NewRouter()
	r.Use(middleware.RequestID)
	r.Use(middleware.RealIP)
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(middleware.Timeout(30 * time.Second))

	r.Get("/baby", handleBaby)
	r.Get("/daddy", handleDaddy)
	r.Handle("/components/*", http.FileServer(http.Dir(".")))
	r.Get("/folders", handleFolders)
	r.Handle("/*", http.FileServer(http.Dir("./pages")))

	http.ListenAndServe(":3333", r)
}

func handleBaby(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Print("upgrade:", err)
		return
	}
	baby = conn
	defer conn.Close()
	for {
		messageType, message, err := conn.ReadMessage()
		if err != nil {
			break
		}
		if err := daddy.WriteMessage(messageType, message); err != nil {
			break
		}
	}
}

func handleDaddy(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Print("upgrade:", err)
		return
	}
	daddy = conn
	defer daddy.Close()
	for {
		messageType, message, err := daddy.ReadMessage()
		if err != nil {
			break
		}
		if err := baby.WriteMessage(messageType, message); err != nil {
			break
		}
	}
}

func handleFolders(w http.ResponseWriter, r *http.Request) {
	folders := getFolderNames()
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(folders)
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
