#!/usr/bin/env python3
"""
Markdown to HWPX converter.

Based directly on the proven gen.py implementation.
Only minimal, safe improvements applied:
  1. XML special character escaping (prevents document corruption)
  2. List items separated into individual paragraphs (fixes line break issue)
  3. Ordered list numbers (1., 2., 3. instead of bullets)

Usage:
    python md_to_hwpx.py <input.md> <output.hwpx>
    python md_to_hwpx.py --content "<markdown string>" <output.hwpx>
"""

import os
import sys
import argparse
import zipfile
import tempfile
import shutil
import markdown
from bs4 import BeautifulSoup, NavigableString
from datetime import datetime
from xml.sax.saxutils import escape


# ---------------------------------------------------------------------------
# XML structure generators — kept identical to original gen.py
# ---------------------------------------------------------------------------

NAMESPACES = (
    'xmlns:ha="http://www.hancom.co.kr/hwpml/2011/app" '
    'xmlns:hp="http://www.hancom.co.kr/hwpml/2011/paragraph" '
    'xmlns:hp10="http://www.hancom.co.kr/hwpml/2016/paragraph" '
    'xmlns:hs="http://www.hancom.co.kr/hwpml/2011/section" '
    'xmlns:hc="http://www.hancom.co.kr/hwpml/2011/core" '
    'xmlns:hh="http://www.hancom.co.kr/hwpml/2011/head" '
    'xmlns:hhs="http://www.hancom.co.kr/hwpml/2011/history" '
    'xmlns:hm="http://www.hancom.co.kr/hwpml/2011/master-page" '
    'xmlns:hpf="http://www.hancom.co.kr/schema/2011/hpf" '
    'xmlns:dc="http://purl.org/dc/elements/1.1/" '
    'xmlns:opf="http://www.idpf.org/2007/opf/" '
    'xmlns:ooxmlchart="http://www.hancom.co.kr/hwpml/2016/ooxmlchart" '
    'xmlns:hwpunitchar="http://www.hancom.co.kr/hwpml/2016/HwpUnitChar" '
    'xmlns:epub="http://www.idpf.org/2007/ops" '
    'xmlns:config="urn:oasis:names:tc:opendocument:xmlns:config:1.0"'
)


def create_mimetype_file(temp_dir):
    """mimetype 파일 생성"""
    with open(os.path.join(temp_dir, "mimetype"), "w", encoding="utf-8") as f:
        f.write("application/hwp+zip")


def create_settings_xml(temp_dir):
    """settings.xml 파일 생성 — 원본과 동일"""
    settings_content = """<?xml version="1.0" encoding="UTF-8" standalone="yes" ?>
<ha:HWPApplicationSetting xmlns:ha="http://www.hancom.co.kr/hwpml/2011/app" xmlns:config="urn:oasis:names:tc:opendocument:xmlns:config:1.0">
  <ha:CaretPosition listIDRef="0" paraIDRef="4" pos="2"/>
</ha:HWPApplicationSetting>"""

    with open(os.path.join(temp_dir, "settings.xml"), "w", encoding="utf-8") as f:
        f.write(settings_content)


def create_version_xml(temp_dir):
    """version.xml 파일 생성 — 원본과 동일"""
    version_content = """<?xml version="1.0" encoding="UTF-8" standalone="yes" ?>
<hv:HCFVersion xmlns:hv="http://www.hancom.co.kr/hwpml/2011/version" tagetApplication="WORDPROCESSOR" major="5" minor="1" micro="0" buildNumber="1" os="1" xmlVersion="1.4" application="Hancom Office Hangul" appVersion="10, 0, 0, 11808 WIN32LEWindows_8"/>"""

    with open(os.path.join(temp_dir, "version.xml"), "w", encoding="utf-8") as f:
        f.write(version_content)


def create_preview_text(temp_dir, soup):
    """Preview/PrvText.txt 파일 생성 — 원본과 동일"""
    preview_text = ""
    for element in soup.find_all(["h1", "h2", "h3", "h4", "h5", "h6", "p"]):
        preview_text += element.text + "\n"
    preview_text = preview_text[:100]

    with open(
        os.path.join(temp_dir, "Preview", "PrvText.txt"), "w", encoding="utf-8"
    ) as f:
        f.write(preview_text)


def create_container_files(temp_dir):
    """META-INF 디렉토리의 컨테이너 파일들 생성 — 원본과 동일"""
    # container.rdf
    container_rdf = """<?xml version="1.0" encoding="UTF-8" standalone="yes" ?>
<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
  <rdf:Description rdf:about="">
    <ns0:hasPart xmlns:ns0="http://www.hancom.co.kr/hwpml/2016/meta/pkg#" rdf:resource="Contents/header.xml"/>
  </rdf:Description>
  <rdf:Description rdf:about="Contents/header.xml">
    <rdf:type rdf:resource="http://www.hancom.co.kr/hwpml/2016/meta/pkg#HeaderFile"/>
  </rdf:Description>
  <rdf:Description rdf:about="">
    <ns0:hasPart xmlns:ns0="http://www.hancom.co.kr/hwpml/2016/meta/pkg#" rdf:resource="Contents/section0.xml"/>
  </rdf:Description>
  <rdf:Description rdf:about="Contents/section0.xml">
    <rdf:type rdf:resource="http://www.hancom.co.kr/hwpml/2016/meta/pkg#SectionFile"/>
  </rdf:Description>
  <rdf:Description rdf:about="">
    <rdf:type rdf:resource="http://www.hancom.co.kr/hwpml/2016/meta/pkg#Document"/>
  </rdf:Description>
</rdf:RDF>"""

    with open(
        os.path.join(temp_dir, "META-INF", "container.rdf"), "w", encoding="utf-8"
    ) as f:
        f.write(container_rdf)

    # container.xml
    container_xml = """<?xml version="1.0" encoding="UTF-8" standalone="yes" ?>
<ocf:container xmlns:ocf="urn:oasis:names:tc:opendocument:xmlns:container" xmlns:hpf="http://www.hancom.co.kr/schema/2011/hpf">
  <ocf:rootfiles>
    <ocf:rootfile full-path="Contents/content.hpf" media-type="application/hwpml-package+xml"/>
    <ocf:rootfile full-path="Preview/PrvText.txt" media-type="text/plain"/>
    <ocf:rootfile full-path="META-INF/container.rdf" media-type="application/rdf+xml"/>
  </ocf:rootfiles>
</ocf:container>"""

    with open(
        os.path.join(temp_dir, "META-INF", "container.xml"), "w", encoding="utf-8"
    ) as f:
        f.write(container_xml)

    # manifest.xml
    manifest_xml = """<?xml version="1.0" encoding="UTF-8" standalone="yes" ?>
<odf:manifest xmlns:odf="urn:oasis:names:tc:opendocument:xmlns:manifest:1.0"/>"""

    with open(
        os.path.join(temp_dir, "META-INF", "manifest.xml"), "w", encoding="utf-8"
    ) as f:
        f.write(manifest_xml)


def create_content_hpf(temp_dir, title):
    """Contents/content.hpf 파일 생성 — 원본과 동일 (title만 escape 추가)"""
    current_date = datetime.now().strftime("%Y-%m-%dT%H:%M:%SZ")
    kr_date = datetime.now().strftime("%Y년 %m월 %d일 %A 오후 %I:%M:%S")

    content_hpf = f"""<?xml version="1.0" encoding="UTF-8" standalone="yes" ?>
<opf:package {NAMESPACES} version="" unique-identifier="" id="">
  <opf:metadata>
    <opf:title>{escape(title)}</opf:title>
    <opf:language>ko</opf:language>
    <opf:meta name="creator" content="text">Markdown Converter</opf:meta>
    <opf:meta name="subject" content="text"/>
    <opf:meta name="description" content="text"/>
    <opf:meta name="lastsaveby" content="text">Markdown Converter</opf:meta>
    <opf:meta name="CreatedDate" content="text">{current_date}</opf:meta>
    <opf:meta name="ModifiedDate" content="text">{current_date}</opf:meta>
    <opf:meta name="date" content="text">{kr_date}</opf:meta>
    <opf:meta name="keyword" content="text"/>
  </opf:metadata>
  <opf:manifest>
    <opf:item id="header" href="Contents/header.xml" media-type="application/xml"/>
    <opf:item id="section0" href="Contents/section0.xml" media-type="application/xml"/>
    <opf:item id="settings" href="settings.xml" media-type="application/xml"/>
  </opf:manifest>
  <opf:spine>
    <opf:itemref idref="header" linear="yes"/>
    <opf:itemref idref="section0" linear="no"/>
  </opf:spine>
</opf:package>"""

    with open(
        os.path.join(temp_dir, "Contents", "content.hpf"), "w", encoding="utf-8"
    ) as f:
        f.write(content_hpf)


def create_header_xml(temp_dir):
    """Contents/header.xml 파일 생성 — 사용자 샘플(test_table_only.hwpx) 기반

    charPr ID 매핑:
      0: 본문 일반 (한컴바탕, fontRef=0, borderFillIDRef=1)
      1: 표/함초롬 일반 (함초롬돋움, fontRef=1, borderFillIDRef=2)
      2: 표/함초롬 기울임 (함초롬돋움, italic, borderFillIDRef=2)
      3: 표/함초롬 굵게 (함초롬돋움, bold, borderFillIDRef=2)
      4: 본문 굵게 (함초롬돋움, fontRef=1, bold, borderFillIDRef=2)
      5: 본문 기울임 (함초롬돋움, fontRef=1, italic, borderFillIDRef=2)
      6: 본문 굵게+기울임 (함초롬돋움, fontRef=1, italic+bold, borderFillIDRef=2)
    """
    header_xml = f"""<?xml version="1.0" encoding="UTF-8" standalone="yes" ?>
<hh:head {NAMESPACES} version="1.5" secCnt="1">
  <hh:beginNum page="1" footnote="1" endnote="1" pic="1" tbl="1" equation="1"/>
  <hh:refList>
    <hh:fontfaces itemCnt="7">
      <hh:fontface lang="HANGUL" fontCnt="2">
        <hh:font id="0" face="한컴바탕" type="TTF" isEmbedded="0">
          <hh:typeInfo familyType="FCAT_GOTHIC" weight="6" proportion="0" contrast="0" strokeVariation="1" armStyle="1" letterform="1" midline="1" xHeight="1"/>
        </hh:font>
        <hh:font id="1" face="함초롬돋움" type="TTF" isEmbedded="0">
          <hh:typeInfo familyType="FCAT_GOTHIC" weight="6" proportion="4" contrast="0" strokeVariation="1" armStyle="1" letterform="1" midline="1" xHeight="1"/>
        </hh:font>
      </hh:fontface>
      <hh:fontface lang="LATIN" fontCnt="2">
        <hh:font id="0" face="한컴바탕" type="TTF" isEmbedded="0">
          <hh:typeInfo familyType="FCAT_GOTHIC" weight="6" proportion="0" contrast="0" strokeVariation="1" armStyle="1" letterform="1" midline="1" xHeight="1"/>
        </hh:font>
        <hh:font id="1" face="함초롬돋움" type="TTF" isEmbedded="0">
          <hh:typeInfo familyType="FCAT_GOTHIC" weight="6" proportion="4" contrast="0" strokeVariation="1" armStyle="1" letterform="1" midline="1" xHeight="1"/>
        </hh:font>
      </hh:fontface>
      <hh:fontface lang="HANJA" fontCnt="2">
        <hh:font id="0" face="함초롬바탕" type="TTF" isEmbedded="0">
          <hh:typeInfo familyType="FCAT_GOTHIC" weight="6" proportion="4" contrast="0" strokeVariation="1" armStyle="1" letterform="1" midline="1" xHeight="1"/>
        </hh:font>
        <hh:font id="1" face="함초롬돋움" type="TTF" isEmbedded="0">
          <hh:typeInfo familyType="FCAT_GOTHIC" weight="6" proportion="4" contrast="0" strokeVariation="1" armStyle="1" letterform="1" midline="1" xHeight="1"/>
        </hh:font>
      </hh:fontface>
      <hh:fontface lang="JAPANESE" fontCnt="2">
        <hh:font id="0" face="한컴바탕" type="TTF" isEmbedded="0">
          <hh:typeInfo familyType="FCAT_GOTHIC" weight="6" proportion="0" contrast="0" strokeVariation="1" armStyle="1" letterform="1" midline="1" xHeight="1"/>
        </hh:font>
        <hh:font id="1" face="함초롬돋움" type="TTF" isEmbedded="0">
          <hh:typeInfo familyType="FCAT_GOTHIC" weight="6" proportion="4" contrast="0" strokeVariation="1" armStyle="1" letterform="1" midline="1" xHeight="1"/>
        </hh:font>
      </hh:fontface>
      <hh:fontface lang="OTHER" fontCnt="2">
        <hh:font id="0" face="한컴바탕" type="TTF" isEmbedded="0">
          <hh:typeInfo familyType="FCAT_GOTHIC" weight="6" proportion="0" contrast="0" strokeVariation="1" armStyle="1" letterform="1" midline="1" xHeight="1"/>
        </hh:font>
        <hh:font id="1" face="함초롬돋움" type="TTF" isEmbedded="0">
          <hh:typeInfo familyType="FCAT_GOTHIC" weight="6" proportion="4" contrast="0" strokeVariation="1" armStyle="1" letterform="1" midline="1" xHeight="1"/>
        </hh:font>
      </hh:fontface>
      <hh:fontface lang="SYMBOL" fontCnt="2">
        <hh:font id="0" face="한컴바탕" type="TTF" isEmbedded="0">
          <hh:typeInfo familyType="FCAT_GOTHIC" weight="6" proportion="0" contrast="0" strokeVariation="1" armStyle="1" letterform="1" midline="1" xHeight="1"/>
        </hh:font>
        <hh:font id="1" face="함초롬돋움" type="TTF" isEmbedded="0">
          <hh:typeInfo familyType="FCAT_GOTHIC" weight="6" proportion="4" contrast="0" strokeVariation="1" armStyle="1" letterform="1" midline="1" xHeight="1"/>
        </hh:font>
      </hh:fontface>
      <hh:fontface lang="USER" fontCnt="2">
        <hh:font id="0" face="한컴바탕" type="TTF" isEmbedded="0">
          <hh:typeInfo familyType="FCAT_GOTHIC" weight="6" proportion="0" contrast="0" strokeVariation="1" armStyle="1" letterform="1" midline="1" xHeight="1"/>
        </hh:font>
        <hh:font id="1" face="함초롬돋움" type="TTF" isEmbedded="0">
          <hh:typeInfo familyType="FCAT_GOTHIC" weight="6" proportion="4" contrast="0" strokeVariation="1" armStyle="1" letterform="1" midline="1" xHeight="1"/>
        </hh:font>
      </hh:fontface>
    </hh:fontfaces>
    <hh:borderFills itemCnt="3">
      <hh:borderFill id="1" threeD="0" shadow="0" centerLine="NONE" breakCellSeparateLine="0">
        <hh:slash type="NONE" Crooked="0" isCounter="0"/>
        <hh:backSlash type="NONE" Crooked="0" isCounter="0"/>
        <hh:leftBorder type="NONE" width="0.1 mm" color="#000000"/>
        <hh:rightBorder type="NONE" width="0.1 mm" color="#000000"/>
        <hh:topBorder type="NONE" width="0.1 mm" color="#000000"/>
        <hh:bottomBorder type="NONE" width="0.1 mm" color="#000000"/>
        <hh:diagonal type="SOLID" width="0.1 mm" color="#000000"/>
      </hh:borderFill>
      <hh:borderFill id="2" threeD="0" shadow="0" centerLine="NONE" breakCellSeparateLine="0">
        <hh:slash type="NONE" Crooked="0" isCounter="0"/>
        <hh:backSlash type="NONE" Crooked="0" isCounter="0"/>
        <hh:leftBorder type="NONE" width="0.1 mm" color="#000000"/>
        <hh:rightBorder type="NONE" width="0.1 mm" color="#000000"/>
        <hh:topBorder type="NONE" width="0.1 mm" color="#000000"/>
        <hh:bottomBorder type="NONE" width="0.1 mm" color="#000000"/>
        <hh:diagonal type="SOLID" width="0.1 mm" color="#000000"/>
        <hc:fillBrush>
          <hc:winBrush faceColor="none" hatchColor="#999999" alpha="0"/>
        </hc:fillBrush>
      </hh:borderFill>
      <hh:borderFill id="3" threeD="0" shadow="0" centerLine="NONE" breakCellSeparateLine="0">
        <hh:slash type="NONE" Crooked="0" isCounter="0"/>
        <hh:backSlash type="NONE" Crooked="0" isCounter="0"/>
        <hh:leftBorder type="SOLID" width="0.12 mm" color="#000000"/>
        <hh:rightBorder type="SOLID" width="0.12 mm" color="#000000"/>
        <hh:topBorder type="SOLID" width="0.12 mm" color="#000000"/>
        <hh:bottomBorder type="SOLID" width="0.12 mm" color="#000000"/>
        <hh:diagonal type="SOLID" width="0.1 mm" color="#000000"/>
      </hh:borderFill>
    </hh:borderFills>
    <hh:charProperties itemCnt="10">
      <hh:charPr id="0" height="1000" textColor="#000000" shadeColor="none" useFontSpace="0" useKerning="0" symMark="NONE" borderFillIDRef="1">
        <hh:fontRef hangul="0" latin="0" hanja="0" japanese="0" other="0" symbol="0" user="0"/>
        <hh:ratio hangul="100" latin="100" hanja="100" japanese="100" other="100" symbol="100" user="100"/>
        <hh:spacing hangul="0" latin="0" hanja="0" japanese="0" other="0" symbol="0" user="0"/>
        <hh:relSz hangul="100" latin="100" hanja="100" japanese="100" other="100" symbol="100" user="100"/>
        <hh:offset hangul="0" latin="0" hanja="0" japanese="0" other="0" symbol="0" user="0"/>
        <hh:underline type="NONE" shape="SOLID" color="#000000"/>
        <hh:strikeout shape="NONE" color="#000000"/>
        <hh:outline type="NONE"/>
        <hh:shadow type="NONE" color="#B2B2B2" offsetX="10" offsetY="10"/>
      </hh:charPr>
      <hh:charPr id="1" height="1000" textColor="#000000" shadeColor="none" useFontSpace="0" useKerning="0" symMark="NONE" borderFillIDRef="2">
        <hh:fontRef hangul="1" latin="1" hanja="1" japanese="1" other="1" symbol="1" user="1"/>
        <hh:ratio hangul="100" latin="100" hanja="100" japanese="100" other="100" symbol="100" user="100"/>
        <hh:spacing hangul="0" latin="0" hanja="0" japanese="0" other="0" symbol="0" user="0"/>
        <hh:relSz hangul="100" latin="100" hanja="100" japanese="100" other="100" symbol="100" user="100"/>
        <hh:offset hangul="0" latin="0" hanja="0" japanese="0" other="0" symbol="0" user="0"/>
        <hh:underline type="NONE" shape="SOLID" color="#000000"/>
        <hh:strikeout shape="NONE" color="#000000"/>
        <hh:outline type="NONE"/>
        <hh:shadow type="NONE" color="#B2B2B2" offsetX="10" offsetY="10"/>
      </hh:charPr>
      <hh:charPr id="2" height="1000" textColor="#000000" shadeColor="none" useFontSpace="0" useKerning="0" symMark="NONE" borderFillIDRef="2">
        <hh:fontRef hangul="1" latin="1" hanja="1" japanese="1" other="1" symbol="1" user="1"/>
        <hh:ratio hangul="100" latin="100" hanja="100" japanese="100" other="100" symbol="100" user="100"/>
        <hh:spacing hangul="0" latin="0" hanja="0" japanese="0" other="0" symbol="0" user="0"/>
        <hh:relSz hangul="100" latin="100" hanja="100" japanese="100" other="100" symbol="100" user="100"/>
        <hh:offset hangul="0" latin="0" hanja="0" japanese="0" other="0" symbol="0" user="0"/>
        <hh:italic/>
        <hh:underline type="NONE" shape="SOLID" color="#000000"/>
        <hh:strikeout shape="NONE" color="#000000"/>
        <hh:outline type="NONE"/>
        <hh:shadow type="NONE" color="#B2B2B2" offsetX="10" offsetY="10"/>
      </hh:charPr>
      <hh:charPr id="3" height="1000" textColor="#000000" shadeColor="none" useFontSpace="0" useKerning="0" symMark="NONE" borderFillIDRef="2">
        <hh:fontRef hangul="1" latin="1" hanja="1" japanese="1" other="1" symbol="1" user="1"/>
        <hh:ratio hangul="100" latin="100" hanja="100" japanese="100" other="100" symbol="100" user="100"/>
        <hh:spacing hangul="0" latin="0" hanja="0" japanese="0" other="0" symbol="0" user="0"/>
        <hh:relSz hangul="100" latin="100" hanja="100" japanese="100" other="100" symbol="100" user="100"/>
        <hh:offset hangul="0" latin="0" hanja="0" japanese="0" other="0" symbol="0" user="0"/>
        <hh:bold/>
        <hh:underline type="NONE" shape="SOLID" color="#000000"/>
        <hh:strikeout shape="NONE" color="#000000"/>
        <hh:outline type="NONE"/>
        <hh:shadow type="NONE" color="#B2B2B2" offsetX="10" offsetY="10"/>
      </hh:charPr>
      <hh:charPr id="4" height="1000" textColor="#000000" shadeColor="none" useFontSpace="0" useKerning="0" symMark="NONE" borderFillIDRef="2">
        <hh:fontRef hangul="1" latin="1" hanja="1" japanese="1" other="1" symbol="1" user="1"/>
        <hh:ratio hangul="100" latin="100" hanja="100" japanese="100" other="100" symbol="100" user="100"/>
        <hh:spacing hangul="0" latin="0" hanja="0" japanese="0" other="0" symbol="0" user="0"/>
        <hh:relSz hangul="100" latin="100" hanja="100" japanese="100" other="100" symbol="100" user="100"/>
        <hh:offset hangul="0" latin="0" hanja="0" japanese="0" other="0" symbol="0" user="0"/>
        <hh:bold/>
        <hh:underline type="NONE" shape="SOLID" color="#000000"/>
        <hh:strikeout shape="NONE" color="#000000"/>
        <hh:outline type="NONE"/>
        <hh:shadow type="NONE" color="#B2B2B2" offsetX="10" offsetY="10"/>
      </hh:charPr>
      <hh:charPr id="5" height="1000" textColor="#000000" shadeColor="none" useFontSpace="0" useKerning="0" symMark="NONE" borderFillIDRef="2">
        <hh:fontRef hangul="1" latin="1" hanja="1" japanese="1" other="1" symbol="1" user="1"/>
        <hh:ratio hangul="100" latin="100" hanja="100" japanese="100" other="100" symbol="100" user="100"/>
        <hh:spacing hangul="0" latin="0" hanja="0" japanese="0" other="0" symbol="0" user="0"/>
        <hh:relSz hangul="100" latin="100" hanja="100" japanese="100" other="100" symbol="100" user="100"/>
        <hh:offset hangul="0" latin="0" hanja="0" japanese="0" other="0" symbol="0" user="0"/>
        <hh:italic/>
        <hh:underline type="NONE" shape="SOLID" color="#000000"/>
        <hh:strikeout shape="NONE" color="#000000"/>
        <hh:outline type="NONE"/>
        <hh:shadow type="NONE" color="#B2B2B2" offsetX="10" offsetY="10"/>
      </hh:charPr>
      <hh:charPr id="6" height="1000" textColor="#000000" shadeColor="none" useFontSpace="0" useKerning="0" symMark="NONE" borderFillIDRef="2">
        <hh:fontRef hangul="1" latin="1" hanja="1" japanese="1" other="1" symbol="1" user="1"/>
        <hh:ratio hangul="100" latin="100" hanja="100" japanese="100" other="100" symbol="100" user="100"/>
        <hh:spacing hangul="0" latin="0" hanja="0" japanese="0" other="0" symbol="0" user="0"/>
        <hh:relSz hangul="100" latin="100" hanja="100" japanese="100" other="100" symbol="100" user="100"/>
        <hh:offset hangul="0" latin="0" hanja="0" japanese="0" other="0" symbol="0" user="0"/>
        <hh:italic/>
        <hh:bold/>
        <hh:underline type="NONE" shape="SOLID" color="#000000"/>
        <hh:strikeout shape="NONE" color="#000000"/>
        <hh:outline type="NONE"/>
        <hh:shadow type="NONE" color="#B2B2B2" offsetX="10" offsetY="10"/>
      </hh:charPr>
      <hh:charPr id="7" height="1600" textColor="#000000" shadeColor="none" useFontSpace="0" useKerning="0" symMark="NONE" borderFillIDRef="2">
        <hh:fontRef hangul="1" latin="1" hanja="1" japanese="1" other="1" symbol="1" user="1"/>
        <hh:ratio hangul="100" latin="100" hanja="100" japanese="100" other="100" symbol="100" user="100"/>
        <hh:spacing hangul="0" latin="0" hanja="0" japanese="0" other="0" symbol="0" user="0"/>
        <hh:relSz hangul="100" latin="100" hanja="100" japanese="100" other="100" symbol="100" user="100"/>
        <hh:offset hangul="0" latin="0" hanja="0" japanese="0" other="0" symbol="0" user="0"/>
        <hh:bold/>
        <hh:underline type="NONE" shape="SOLID" color="#000000"/>
        <hh:strikeout shape="NONE" color="#000000"/>
        <hh:outline type="NONE"/>
        <hh:shadow type="NONE" color="#B2B2B2" offsetX="10" offsetY="10"/>
      </hh:charPr>
      <hh:charPr id="8" height="1400" textColor="#000000" shadeColor="none" useFontSpace="0" useKerning="0" symMark="NONE" borderFillIDRef="2">
        <hh:fontRef hangul="1" latin="1" hanja="1" japanese="1" other="1" symbol="1" user="1"/>
        <hh:ratio hangul="100" latin="100" hanja="100" japanese="100" other="100" symbol="100" user="100"/>
        <hh:spacing hangul="0" latin="0" hanja="0" japanese="0" other="0" symbol="0" user="0"/>
        <hh:relSz hangul="100" latin="100" hanja="100" japanese="100" other="100" symbol="100" user="100"/>
        <hh:offset hangul="0" latin="0" hanja="0" japanese="0" other="0" symbol="0" user="0"/>
        <hh:bold/>
        <hh:underline type="NONE" shape="SOLID" color="#000000"/>
        <hh:strikeout shape="NONE" color="#000000"/>
        <hh:outline type="NONE"/>
        <hh:shadow type="NONE" color="#B2B2B2" offsetX="10" offsetY="10"/>
      </hh:charPr>
      <hh:charPr id="9" height="1200" textColor="#000000" shadeColor="none" useFontSpace="0" useKerning="0" symMark="NONE" borderFillIDRef="2">
        <hh:fontRef hangul="1" latin="1" hanja="1" japanese="1" other="1" symbol="1" user="1"/>
        <hh:ratio hangul="100" latin="100" hanja="100" japanese="100" other="100" symbol="100" user="100"/>
        <hh:spacing hangul="0" latin="0" hanja="0" japanese="0" other="0" symbol="0" user="0"/>
        <hh:relSz hangul="100" latin="100" hanja="100" japanese="100" other="100" symbol="100" user="100"/>
        <hh:offset hangul="0" latin="0" hanja="0" japanese="0" other="0" symbol="0" user="0"/>
        <hh:bold/>
        <hh:underline type="NONE" shape="SOLID" color="#000000"/>
        <hh:strikeout shape="NONE" color="#000000"/>
        <hh:outline type="NONE"/>
        <hh:shadow type="NONE" color="#B2B2B2" offsetX="10" offsetY="10"/>
      </hh:charPr>
    </hh:charProperties>
    <hh:tabProperties itemCnt="1">
      <hh:tabPr id="0" autoTabLeft="0" autoTabRight="0"/>
    </hh:tabProperties>
    <hh:paraProperties itemCnt="1">
      <hh:paraPr id="0" tabPrIDRef="0" condense="0" fontLineHeight="0" snapToGrid="1" suppressLineNumbers="0" checked="0">
        <hh:align horizontal="JUSTIFY" vertical="BASELINE"/>
        <hh:heading type="NONE" idRef="0" level="0"/>
        <hh:breakSetting breakLatinWord="KEEP_WORD" breakNonLatinWord="KEEP_WORD" widowOrphan="0" keepWithNext="0" keepLines="0" pageBreakBefore="0" lineWrap="BREAK"/>
        <hh:autoSpacing eAsianEng="0" eAsianNum="0"/>
        <hp:switch>
          <hp:case hp:required-namespace="http://www.hancom.co.kr/hwpml/2016/HwpUnitChar">
            <hh:margin>
              <hc:intent value="0" unit="HWPUNIT"/>
              <hc:left value="0" unit="HWPUNIT"/>
              <hc:right value="0" unit="HWPUNIT"/>
              <hc:prev value="0" unit="HWPUNIT"/>
              <hc:next value="0" unit="HWPUNIT"/>
            </hh:margin>
            <hh:lineSpacing type="PERCENT" value="160" unit="HWPUNIT"/>
          </hp:case>
          <hp:default>
            <hh:margin>
              <hc:intent value="0" unit="HWPUNIT"/>
              <hc:left value="0" unit="HWPUNIT"/>
              <hc:right value="0" unit="HWPUNIT"/>
              <hc:prev value="0" unit="HWPUNIT"/>
              <hc:next value="0" unit="HWPUNIT"/>
            </hh:margin>
            <hh:lineSpacing type="PERCENT" value="160" unit="HWPUNIT"/>
          </hp:default>
        </hp:switch>
        <hh:border borderFillIDRef="2" offsetLeft="0" offsetRight="0" offsetTop="0" offsetBottom="0" connect="0" ignoreMargin="0"/>
      </hh:paraPr>
    </hh:paraProperties>
    <hh:styles itemCnt="1">
      <hh:style id="0" type="PARA" name="바탕글" engName="Normal" paraPrIDRef="0" charPrIDRef="0" nextStyleIDRef="0" langID="1042" lockForm="0"/>
    </hh:styles>
  </hh:refList>
  <hh:compatibleDocument targetProgram="HWP201X">
    <hh:layoutCompatibility/>
  </hh:compatibleDocument>
  <hh:docOption>
    <hh:linkinfo path="" pageInherit="0" footnoteInherit="0"/>
  </hh:docOption>
  <hh:trackchageConfig flags="56"/>
</hh:head>"""

    with open(
        os.path.join(temp_dir, "Contents", "header.xml"), "w", encoding="utf-8"
    ) as f:
        f.write(header_xml)


def create_section_xml(temp_dir, soup):
    """마크다운 내용을 바탕으로 section0.xml 파일 생성

    원본 gen.py 구조를 그대로 유지하되, 세 가지만 개선:
    1. XML 특수문자 이스케이프 (escape())
    2. 목록 항목을 별도 <hp:p> 문단으로 분리
    3. 순서 목록에 실제 번호 반영
    """
    # section 시작 부분 — 원본과 동일
    section_start = f"""<?xml version="1.0" encoding="UTF-8" standalone="yes" ?>
<hs:sec {NAMESPACES}>"""

    # 첫 번째 단락의 secPr 부분 — 원본과 동일
    first_p_prefix = """<hp:p id="2692885478" paraPrIDRef="0" styleIDRef="0" pageBreak="0" columnBreak="0" merged="0">
  <hp:run charPrIDRef="0">
    <hp:secPr id="" textDirection="HORIZONTAL" spaceColumns="1134" tabStop="8000" tabStopVal="4000" tabStopUnit="HWPUNIT" outlineShapeIDRef="0" memoShapeIDRef="0" textVerticalWidthHead="0" masterPageCnt="0">
      <hp:grid lineGrid="0" charGrid="0" wonggojiFormat="0"/>
      <hp:startNum pageStartsOn="BOTH" page="0" pic="0" tbl="0" equation="0"/>
      <hp:visibility hideFirstHeader="0" hideFirstFooter="0" hideFirstMasterPage="0" border="SHOW_ALL" fill="SHOW_ALL" hideFirstPageNum="0" hideFirstEmptyLine="0" showLineNumber="0"/>
      <hp:lineNumberShape restartType="0" countBy="0" distance="0" startNumber="0"/>
      <hp:pagePr landscape="WIDELY" width="59528" height="84186" gutterType="LEFT_ONLY">
        <hp:margin header="4252" footer="4252" gutter="0" left="8504" right="8504" top="5668" bottom="4252"/>
      </hp:pagePr>
      <hp:footNotePr>
        <hp:autoNumFormat type="DIGIT" userChar="" prefixChar="" suffixChar=")" supscript="0"/>
        <hp:noteLine length="-1" type="SOLID" width="0.12 mm" color="#000000"/>
        <hp:noteSpacing betweenNotes="283" belowLine="567" aboveLine="850"/>
        <hp:numbering type="CONTINUOUS" newNum="1"/>
        <hp:placement place="EACH_COLUMN" beneathText="0"/>
      </hp:footNotePr>
      <hp:endNotePr>
        <hp:autoNumFormat type="DIGIT" userChar="" prefixChar="" suffixChar=")" supscript="0"/>
        <hp:noteLine length="14692344" type="SOLID" width="0.12 mm" color="#000000"/>
        <hp:noteSpacing betweenNotes="0" belowLine="567" aboveLine="850"/>
        <hp:numbering type="CONTINUOUS" newNum="1"/>
        <hp:placement place="END_OF_DOCUMENT" beneathText="0"/>
      </hp:endNotePr>
      <hp:pageBorderFill type="BOTH" borderFillIDRef="1" textBorder="PAPER" headerInside="0" footerInside="0" fillArea="PAPER">
        <hp:offset left="1417" right="1417" top="1417" bottom="1417"/>
      </hp:pageBorderFill>
      <hp:pageBorderFill type="EVEN" borderFillIDRef="1" textBorder="PAPER" headerInside="0" footerInside="0" fillArea="PAPER">
        <hp:offset left="1417" right="1417" top="1417" bottom="1417"/>
      </hp:pageBorderFill>
      <hp:pageBorderFill type="ODD" borderFillIDRef="1" textBorder="PAPER" headerInside="0" footerInside="0" fillArea="PAPER">
        <hp:offset left="1417" right="1417" top="1417" bottom="1417"/>
      </hp:pageBorderFill>
    </hp:secPr>
    <hp:ctrl>
      <hp:colPr id="" type="NEWSPAPER" layout="LEFT" colCount="1" sameSz="1" sameGap="0"/>
    </hp:ctrl>
  </hp:run>"""

    # 마크다운 요소 처리
    paragraphs = []
    vertical_pos = 0

    # charPrIDRef 매핑 — 본문 vs 표 셀
    BODY_STYLES = {"normal": "0", "bold": "4", "italic": "5", "bold_italic": "6"}
    TABLE_STYLES = {"normal": "1", "bold": "3", "italic": "2", "bold_italic": "3"}

    def _process_inline(element, current_style="0", ctx=None):
        """인라인 HTML 요소를 순회하며 (text, charPrIDRef) 튜플 리스트 반환.
        ctx: 스타일 매핑 dict (BODY_STYLES 또는 TABLE_STYLES)"""
        if ctx is None:
            ctx = BODY_STYLES
        runs = []
        for child in element.children:
            if isinstance(child, NavigableString):
                text = str(child)
                if text:
                    runs.append((text, current_style))
            elif child.name in ['strong', 'b']:
                if current_style == ctx["italic"]:
                    bold_style = ctx["bold_italic"]
                else:
                    bold_style = ctx["bold"]
                runs.extend(_process_inline(child, bold_style, ctx))
            elif child.name in ['em', 'i']:
                if current_style == ctx["bold"]:
                    italic_style = ctx["bold_italic"]
                else:
                    italic_style = ctx["italic"]
                runs.extend(_process_inline(child, italic_style, ctx))
            elif child.name in ['del', 's']:
                runs.extend(_process_inline(child, current_style, ctx))
            elif child.name == 'code':
                runs.append((child.get_text(), current_style))
            elif child.name == 'br':
                runs.append(("\n", current_style))
            else:
                runs.extend(_process_inline(child, current_style, ctx))
        return runs

    def _make_run_lineseg(text, char_pr_id, vert_pos, vert_size=1000):
        """하나의 run + linesegarray XML 조각 생성"""
        baseline = int(vert_size * 0.85)
        spacing = int(vert_size * 0.6)
        return (
            f'\n  <hp:run charPrIDRef="{char_pr_id}">'
            f'\n    <hp:t>{escape(text)}</hp:t>'
            f'\n  </hp:run>'
            f'\n  <hp:linesegarray>'
            f'\n    <hp:lineseg textpos="0" vertpos="{vert_pos}" vertsize="{vert_size}" '
            f'textheight="{vert_size}" baseline="{baseline}" spacing="{spacing}" '
            f'horzpos="0" horzsize="42520" flags="393216"/>'
            f'\n  </hp:linesegarray>'
        )

    def _make_multi_run_lineseg(runs, vert_pos, vert_size=1000):
        """여러 (text, charPrIDRef) 튜플로부터 복수 run + 단일 linesegarray 생성"""
        baseline = int(vert_size * 0.85)
        spacing = int(vert_size * 0.6)
        xml_parts = []
        for text, char_pr_id in runs:
            xml_parts.append(
                f'\n  <hp:run charPrIDRef="{char_pr_id}">'
                f'\n    <hp:t>{escape(text)}</hp:t>'
                f'\n  </hp:run>'
            )
        xml_parts.append(
            f'\n  <hp:linesegarray>'
            f'\n    <hp:lineseg textpos="0" vertpos="{vert_pos}" vertsize="{vert_size}" '
            f'textheight="{vert_size}" baseline="{baseline}" spacing="{spacing}" '
            f'horzpos="0" horzsize="42520" flags="393216"/>'
            f'\n  </hp:linesegarray>'
        )
        return ''.join(xml_parts)

    def _wrap_paragraph(content_xml):
        """content XML을 <hp:p>로 감싸기"""
        return (
            f'<hp:p id="0" paraPrIDRef="0" styleIDRef="0" '
            f'pageBreak="0" columnBreak="0" merged="0">'
            f'{content_xml}</hp:p>'
        )

    for element in soup.find_all(
        ["h1", "h2", "h3", "h4", "h5", "h6", "p", "ul", "ol", "table"]
    ):
        # 목록과 표 안의 단락은 해당 컨테이너에서 이미 변환한다.
        if element.name == "p" and element.find_parent(["li", "td", "th"]):
            continue
        if element.name.startswith("h"):
            # 제목 처리 — h1=16pt bold, h2=14pt bold, h3~h6=12pt bold
            level = int(element.name[1])
            if level == 1:
                char_style = "7"
                font_size = 1600
            elif level == 2:
                char_style = "8"
                font_size = 1400
            else:
                char_style = "9"
                font_size = 1200

            # XML 이스케이프는 _make_run_lineseg에서 한 번만 수행한다.
            content = _make_run_lineseg(element.get_text(), char_style, vertical_pos, font_size)
            vertical_pos += 1600

            if len(paragraphs) == 0:
                paragraphs.append(first_p_prefix + content + "</hp:p>")
            else:
                paragraphs.append(_wrap_paragraph(content))

        elif element.name == "p":
            # 단락 처리 — 인라인 서식 지원 (bold, italic)
            runs = _process_inline(element, "0")
            if not runs:
                continue
            # run이 1개면 기존 방식, 여러 개면 멀티 run 방식
            if len(runs) == 1:
                content = _make_run_lineseg(runs[0][0], runs[0][1], vertical_pos, 1000)
            else:
                content = _make_multi_run_lineseg(runs, vertical_pos, 1000)
            vertical_pos += 1600

            if len(paragraphs) == 0:
                paragraphs.append(first_p_prefix + content + "</hp:p>")
            else:
                paragraphs.append(_wrap_paragraph(content))

        elif element.name in ["ul", "ol"]:
            # [개선] 각 목록 항목을 별도 문단으로 생성 + 인라인 서식 지원
            for idx, li in enumerate(element.find_all("li", recursive=False), start=1):
                prefix = f"{idx}. " if element.name == "ol" else "• "
                # 접두어 run + 내용 inline runs
                inline_runs = _process_inline(li, "0")
                if not inline_runs:
                    inline_runs = [("", "6")]
                # 첫 번째 run에 접두어 붙이기
                first_text, first_style = inline_runs[0]
                all_runs = [(prefix + first_text, first_style)] + inline_runs[1:]

                if len(all_runs) == 1:
                    content = _make_run_lineseg(all_runs[0][0], all_runs[0][1], vertical_pos, 1000)
                else:
                    content = _make_multi_run_lineseg(all_runs, vertical_pos, 1000)
                vertical_pos += 1600

                if len(paragraphs) == 0:
                    paragraphs.append(first_p_prefix + content + "</hp:p>")
                else:
                    paragraphs.append(_wrap_paragraph(content))

        elif element.name == "table":
            # [추가] 표 변환 — 실제 한글 파일 구조 기반
            rows = element.find_all("tr")
            if not rows:
                continue

            row_cnt = len(rows)
            col_cnt = 0
            for row in rows:
                cells = row.find_all(["th", "td"])
                col_cnt = max(col_cnt, len(cells))
            if col_cnt == 0:
                continue

            # 실제 한글 파일 기준 상수
            TBL_WIDTH = 42520
            CELL_MARGIN_LR = 510
            CELL_MARGIN_TB = 141
            OUT_MARGIN = 283
            ROW_HEIGHT = 1282
            CELL_HEIGHT = 282

            cell_width = TBL_WIDTH // col_cnt
            cell_horzsize = cell_width - CELL_MARGIN_LR * 2
            tbl_height = ROW_HEIGHT * row_cnt

            # 행/셀 생성
            rows_xml = ""
            for row_idx, row in enumerate(rows):
                cells = row.find_all(["th", "td"])

                cells_xml = ""
                for col_idx, cell in enumerate(cells):
                    # 표 셀 인라인 서식 처리 (1=일반, 2=기울임, 3=굵게)
                    cell_runs = _process_inline(cell, TABLE_STYLES["normal"], TABLE_STYLES)
                    if not cell_runs:
                        cell_runs = [(" ", "1")]

                    # 셀 내 run XML 생성
                    cell_runs_xml = ""
                    for text, style_id in cell_runs:
                        cell_runs_xml += (
                            f'<hp:run charPrIDRef="{style_id}">'
                            f'<hp:t>{escape(text)}</hp:t>'
                            f'</hp:run>'
                        )

                    cells_xml += (
                        f'<hp:tc name="" header="0" hasMargin="0" protect="0" '
                        f'editable="0" dirty="0" borderFillIDRef="3">'
                        f'<hp:subList id="" textDirection="HORIZONTAL" '
                        f'lineWrap="BREAK" vertAlign="CENTER" '
                        f'linkListIDRef="0" linkListNextIDRef="0" '
                        f'textWidth="0" textHeight="0" hasTextRef="0" hasNumRef="0">'
                        f'<hp:p id="0" paraPrIDRef="0" styleIDRef="0" '
                        f'pageBreak="0" columnBreak="0" merged="0">'
                        f'{cell_runs_xml}'
                        f'<hp:linesegarray>'
                        f'<hp:lineseg textpos="0" vertpos="0" vertsize="1000" '
                        f'textheight="1000" baseline="850" spacing="600" '
                        f'horzpos="0" horzsize="{cell_horzsize}" flags="393216"/>'
                        f'</hp:linesegarray>'
                        f'</hp:p>'
                        f'</hp:subList>'
                        f'<hp:cellAddr colAddr="{col_idx}" rowAddr="{row_idx}"/>'
                        f'<hp:cellSpan colSpan="1" rowSpan="1"/>'
                        f'<hp:cellSz width="{cell_width}" height="{CELL_HEIGHT}"/>'
                        f'<hp:cellMargin left="{CELL_MARGIN_LR}" right="{CELL_MARGIN_LR}" '
                        f'top="{CELL_MARGIN_TB}" bottom="{CELL_MARGIN_TB}"/>'
                        f'</hp:tc>'
                    )

                # 빈 셀로 부족한 열 채우기
                for col_idx in range(len(cells), col_cnt):
                    cells_xml += (
                        f'<hp:tc name="" header="0" hasMargin="0" protect="0" '
                        f'editable="0" dirty="0" borderFillIDRef="3">'
                        f'<hp:subList id="" textDirection="HORIZONTAL" '
                        f'lineWrap="BREAK" vertAlign="CENTER" '
                        f'linkListIDRef="0" linkListNextIDRef="0" '
                        f'textWidth="0" textHeight="0" hasTextRef="0" hasNumRef="0">'
                        f'<hp:p id="0" paraPrIDRef="0" styleIDRef="0" '
                        f'pageBreak="0" columnBreak="0" merged="0">'
                        f'<hp:run charPrIDRef="1">'
                        f'<hp:t> </hp:t>'
                        f'</hp:run>'
                        f'<hp:linesegarray>'
                        f'<hp:lineseg textpos="0" vertpos="0" vertsize="1000" '
                        f'textheight="1000" baseline="850" spacing="600" '
                        f'horzpos="0" horzsize="{cell_horzsize}" flags="393216"/>'
                        f'</hp:linesegarray>'
                        f'</hp:p>'
                        f'</hp:subList>'
                        f'<hp:cellAddr colAddr="{col_idx}" rowAddr="{row_idx}"/>'
                        f'<hp:cellSpan colSpan="1" rowSpan="1"/>'
                        f'<hp:cellSz width="{cell_width}" height="{CELL_HEIGHT}"/>'
                        f'<hp:cellMargin left="{CELL_MARGIN_LR}" right="{CELL_MARGIN_LR}" '
                        f'top="{CELL_MARGIN_TB}" bottom="{CELL_MARGIN_TB}"/>'
                        f'</hp:tc>'
                    )

                rows_xml += f"<hp:tr>{cells_xml}</hp:tr>"

            table_xml = (
                f'<hp:tbl id="2122152489" zOrder="0" numberingType="TABLE" '
                f'textWrap="TOP_AND_BOTTOM" textFlow="BOTH_SIDES" '
                f'lock="0" dropcapstyle="None" pageBreak="CELL" '
                f'repeatHeader="1" rowCnt="{row_cnt}" colCnt="{col_cnt}" '
                f'cellSpacing="0" borderFillIDRef="3" noAdjust="0">'
                f'<hp:sz width="{TBL_WIDTH}" widthRelTo="ABSOLUTE" '
                f'height="{tbl_height}" heightRelTo="ABSOLUTE" protect="0"/>'
                f'<hp:pos treatAsChar="0" affectLSpacing="0" flowWithText="1" '
                f'allowOverlap="0" holdAnchorAndSO="0" vertRelTo="PARA" '
                f'horzRelTo="PARA" vertAlign="TOP" horzAlign="LEFT" '
                f'vertOffset="0" horzOffset="0"/>'
                f'<hp:outMargin left="{OUT_MARGIN}" right="{OUT_MARGIN}" '
                f'top="{OUT_MARGIN}" bottom="{OUT_MARGIN}"/>'
                f'<hp:inMargin left="{CELL_MARGIN_LR}" right="{CELL_MARGIN_LR}" '
                f'top="{CELL_MARGIN_TB}" bottom="{CELL_MARGIN_TB}"/>'
                f'{rows_xml}</hp:tbl>'
            )

            # 실제 한글 파일 구조: <hp:run> 안에 표 + <hp:t/> + lineseg(horzsize=0)
            tbl_content = (
                f'\n  <hp:run charPrIDRef="1">{table_xml}<hp:t/></hp:run>'
                f'\n  <hp:linesegarray>'
                f'\n    <hp:lineseg textpos="0" vertpos="{vertical_pos}" vertsize="1000" '
                f'textheight="1000" baseline="850" spacing="600" '
                f'horzpos="0" horzsize="0" flags="393216"/>'
                f'\n  </hp:linesegarray>'
            )
            vertical_pos += 1600

            if len(paragraphs) == 0:
                paragraphs.append(first_p_prefix + tbl_content + "</hp:p>")
            else:
                paragraphs.append(_wrap_paragraph(tbl_content))

    # 내용이 없는 경우, 빈 단락 추가
    if not paragraphs:
        content = _make_run_lineseg(" ", "6", 0, 1000)
        paragraphs.append(first_p_prefix + content + "</hp:p>")

    # 섹션 종료
    section_end = """</hs:sec>"""

    # 최종 XML 조합
    section_xml = section_start + "".join(paragraphs) + section_end

    with open(
        os.path.join(temp_dir, "Contents", "section0.xml"), "w", encoding="utf-8"
    ) as f:
        f.write(section_xml)


# ---------------------------------------------------------------------------
# Main conversion functions
# ---------------------------------------------------------------------------

def markdown_to_hwpx(md_content, output_file):
    """
    마크다운 문자열을 HWPX 파일로 변환합니다.

    Args:
        md_content: 마크다운 텍스트 문자열
        output_file: 출력 HWPX 파일 경로
    """
    # 마크다운을 HTML로 변환
    html = markdown.markdown(md_content, extensions=['tables'])
    soup = BeautifulSoup(html, "html.parser")

    # 제목 추출
    h1 = soup.find("h1")
    title = h1.text if h1 else "문서"

    temp_dir = tempfile.mkdtemp()

    try:
        # HWPX 파일 구조 생성
        os.makedirs(os.path.join(temp_dir, "META-INF"), exist_ok=True)
        os.makedirs(os.path.join(temp_dir, "Contents"), exist_ok=True)
        os.makedirs(os.path.join(temp_dir, "Preview"), exist_ok=True)

        # 각 구성 요소 생성
        create_mimetype_file(temp_dir)
        create_settings_xml(temp_dir)
        create_version_xml(temp_dir)
        create_preview_text(temp_dir, soup)
        create_container_files(temp_dir)
        create_content_hpf(temp_dir, title)
        create_header_xml(temp_dir)
        create_section_xml(temp_dir, soup)

        # 출력 디렉토리 확인
        out_dir = os.path.dirname(output_file)
        if out_dir:
            os.makedirs(out_dir, exist_ok=True)

        # ZIP 파일로 압축
        with zipfile.ZipFile(output_file, "w") as zip_file:
            # mimetype 파일은 압축하지 않고 첫 번째로 추가
            zip_file.write(
                os.path.join(temp_dir, "mimetype"),
                "mimetype",
                compress_type=zipfile.ZIP_STORED,
            )

            # 나머지 파일들 추가
            for root, _, files in os.walk(temp_dir):
                for file in files:
                    if file != "mimetype":
                        file_path = os.path.join(root, file)
                        arcname = os.path.relpath(file_path, temp_dir)
                        zip_file.write(
                            file_path, arcname, compress_type=zipfile.ZIP_DEFLATED
                        )

        print(f"변환 완료: {output_file}")
        return output_file

    finally:
        shutil.rmtree(temp_dir)


def markdown_file_to_hwpx(md_file, output_file):
    """마크다운 파일을 HWPX로 변환합니다."""
    with open(md_file, "r", encoding="utf-8") as f:
        md_content = f.read()
    return markdown_to_hwpx(md_content, output_file)


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser(description="Markdown을 HWPX로 변환")
    parser.add_argument("input", nargs="?", help="입력 마크다운 파일 경로")
    parser.add_argument("output", help="출력 HWPX 파일 경로")
    parser.add_argument("--content", help="마크다운 문자열 직접 입력 (파일 대신)")

    args = parser.parse_args()

    if args.content:
        markdown_to_hwpx(args.content, args.output)
    elif args.input:
        markdown_file_to_hwpx(args.input, args.output)
    else:
        parser.error("입력 파일 또는 --content 옵션이 필요합니다")


if __name__ == "__main__":
    main()
