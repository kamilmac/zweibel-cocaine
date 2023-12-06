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

func main() {
	r := chi.NewRouter()
	r.Use(middleware.RequestID)
	r.Use(middleware.RealIP)
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(middleware.Timeout(30 * time.Second))

	r.Get("/baby", func(w http.ResponseWriter, r *http.Request) {
		conn, err := upgrader.Upgrade(w, r, nil)
		if err != nil {
			log.Print("upgrade:", err)
			return
		}
		defer conn.Close()
		for {
			messageType, message, err := conn.ReadMessage()
			if err != nil {
				// log.Println("read:", err)
				break
			}
			log.Printf("recv: %s", message)
			if err := daddy.WriteMessage(messageType, message); err != nil {
				log.Println("write:", err)
				break
			}
		}
	})

	r.Get("/daddy", func(w http.ResponseWriter, r *http.Request) {
		conn, err := upgrader.Upgrade(w, r, nil)
		if err != nil {
			log.Print("upgrade:", err)
			return
		}
		daddy = conn
		defer daddy.Close()
		for {
			daddy.ReadMessage()
			// if err != nil {
			// 	log.Println("read:", err)
			// 	break
			// }
			// log.Printf("recv: %s", message)
			// if err := conn.WriteMessage(messageType, message); err != nil {
			// 	log.Println("write:", err)
			// 	break
			// }
		}
	})

	r.Handle("/components/*", http.FileServer(http.Dir(".")))
	r.Get("/folders", func(w http.ResponseWriter, r *http.Request) {
		folders := getFolderNames()
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(folders)
	})
	r.Handle("/*", http.FileServer(http.Dir("./pages")))

	http.ListenAndServe(":3333", r)
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
