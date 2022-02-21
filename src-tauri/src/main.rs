#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]

fn main() {
  tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![write_file])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}

#[tauri::command]
fn write_file(path: &str, data: Vec<u8>) {
  println!("writing file {}", path);
  std::fs::write(path, data).expect("error while writing file");
}
