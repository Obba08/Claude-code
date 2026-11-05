"""Print the paragraph text of a .docx file (e.g. a YT-to-Text transcript export)."""
import html, re, sys, zipfile

with zipfile.ZipFile(sys.argv[1]) as z:
    xml = z.read("word/document.xml").decode("utf8")
for p in re.findall(r"<w:p[ >].*?</w:p>", xml, re.S):
    text = "".join(re.findall(r"<w:t[^>]*>([^<]*)</w:t>", p))
    if text.strip():
        print(html.unescape(text))
