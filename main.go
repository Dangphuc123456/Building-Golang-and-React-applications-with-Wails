package main

import (
	"embed"
    "Device-t/backend/config"
	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
)

//go:embed all:frontend/dist
var assets embed.FS

func main() {
	config.ConnectDB()
	app := NewApp() // không cần truyền gì, App sẽ tự khởi tạo service

	err := wails.Run(&options.App{
		Title:  "Device-t",
		Width:  1024,
		Height: 768,
		AssetServer: &assetserver.Options{
			Assets: assets,
		},
		BackgroundColour: &options.RGBA{R: 27, G: 38, B: 54, A: 1},
		OnStartup:        app.Startup,
		Bind: []interface{}{
			app, // bind App để FE gọi method
		},
	})

	if err != nil {
		println("Error:", err.Error())
	}
}
