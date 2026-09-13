"""Check text preservation in generated HWPX, without requiring Hancom Office."""
import importlib.util
from pathlib import Path
from tempfile import TemporaryDirectory
import unittest
import xml.etree.ElementTree as ET
from zipfile import ZIP_STORED, ZipFile

ROOT = Path(__file__).resolve().parents[1]
SCRIPT = ROOT / "skills/public/md-to-hwpx/scripts/md_to_hwpx.py"
spec = importlib.util.spec_from_file_location("md_to_hwpx", SCRIPT)
converter = importlib.util.module_from_spec(spec)
spec.loader.exec_module(converter)
HP = "{http://www.hancom.co.kr/hwpml/2011/paragraph}"


class HWPXTextTests(unittest.TestCase):
    def convert(self, source):
        with TemporaryDirectory(prefix="modu-hwpx-") as folder:
            result = Path(folder) / "result.hwpx"
            converter.markdown_to_hwpx(source, str(result))
            with ZipFile(result) as archive:
                self.assertIsNone(archive.testzip())
                self.assertEqual(archive.infolist()[0].filename, "mimetype")
                self.assertEqual(archive.infolist()[0].compress_type, ZIP_STORED)
                self.assertEqual(archive.read("mimetype"), b"application/hwp+zip")
                for name in archive.namelist():
                    if name.endswith((".xml", ".hpf", ".rdf")):
                        ET.fromstring(archive.read(name))
                return ET.fromstring(archive.read("Contents/section0.xml"))

    def test_special_characters_in_heading_and_body(self):
        tree = self.convert("# A & B < C > D\n\nBody & more < text >.")
        text = "".join(node.text or "" for node in tree.iter(HP + "t"))
        self.assertIn("A & B < C > D", text)
        self.assertIn("Body & more < text >.", text)
        self.assertNotIn("&amp;", text)

    def test_loose_list_paragraphs_are_not_duplicated(self):
        tree = self.convert("- First unique item\n\n- Second unique item")
        text = "".join(node.text or "" for node in tree.iter(HP + "t"))
        self.assertEqual(text.count("First unique item"), 1)
        self.assertEqual(text.count("Second unique item"), 1)

    def test_ordered_list_table_and_inline_styles(self):
        tree = self.convert(
            "1. First\n2. Second\n\n## Table\n\n"
            "| Name | Value |\n| --- | --- |\n| **Bold** | *Italic* |"
        )
        text = "".join(node.text or "" for node in tree.iter(HP + "t"))
        self.assertIn("1. First", text)
        self.assertIn("2. Second", text)
        self.assertEqual(len(list(tree.iter(HP + "tbl"))), 1)
        styled = {
            run.get("charPrIDRef"): "".join(node.text or "" for node in run.iter(HP + "t"))
            for run in tree.iter(HP + "run")
        }
        self.assertEqual(styled.get("3"), "Bold")
        self.assertEqual(styled.get("2"), "Italic")


if __name__ == "__main__":
    unittest.main()
