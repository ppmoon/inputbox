use global_hotkey::hotkey::{Code, Modifiers};
use tauri::Manager;
use tauri_plugin_global_shortcut::{GlobalShortcutExt, ShortcutState};

#[cfg(target_os = "macos")]
use tauri::ActivationPolicy;

pub fn run() {
    tauri::Builder::default()
        .plugin(
            tauri_plugin_global_shortcut::Builder::new()
                .with_handler(|app, shortcut, event| {
                    if shortcut.matches(Modifiers::ALT | Modifiers::SHIFT, Code::Space)
                        && event.state == ShortcutState::Pressed
                    {
                        if let Some(window) = app.get_webview_window("main") {
                            match window.is_visible() {
                                Ok(true) => {
                                    let _ = window.hide();
                                }
                                Ok(false) => {
                                    let _ = window.show();
                                    let _ = window.set_focus();
                                }
                                Err(_) => {}
                            }
                        }
                    }
                })
                .build(),
        )
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_shell::init())
        .setup(|app| {
            #[cfg(target_os = "macos")]
            app.set_activation_policy(ActivationPolicy::Accessory);

            let window = app.get_webview_window("main").unwrap();
            // Force transparent webview background
            let _ = window.eval(
                "document.documentElement.style.setProperty('background','transparent','important');\
                 document.body.style.setProperty('background','transparent','important');",
            );

            app.global_shortcut().register("Shift+Alt+Space")?;
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running InputBox");
}
