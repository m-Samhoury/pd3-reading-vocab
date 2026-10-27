// Render every page of a PDF to PNG (for scanned exam papers with no text layer).
// Usage: swift render.swift <input.pdf> <output_dir>
import PDFKit
import AppKit
let args = CommandLine.arguments
let doc = PDFDocument(url: URL(fileURLWithPath: args[1]))!
let out = args[2]
try? FileManager.default.createDirectory(atPath: out, withIntermediateDirectories: true)
for i in 0..<doc.pageCount {
  let p = doc.page(at: i)!
  let r = p.bounds(for: .mediaBox)
  let scale: CGFloat = 1600 / max(r.width, r.height)
  let img = p.thumbnail(of: NSSize(width: r.width*scale, height: r.height*scale), for: .mediaBox)
  let rep = NSBitmapImageRep(data: img.tiffRepresentation!)!
  try! rep.representation(using: .png, properties: [:])!.write(to: URL(fileURLWithPath: "\(out)/p\(String(format: "%02d", i+1)).png"))
}
