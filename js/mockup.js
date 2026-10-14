/* Pure-JS port of src/components/artwork.tsx + src/components/mockup.tsx + src/lib/format.ts
   Used both by the Eleventy build (as a Node require) and as a browser bundle via passthrough. */

(function (root, factory) {
  if (typeof module !== "undefined" && module.exports) {
    module.exports = factory();
  } else {
    root.PaddleUpMockup = factory();
  }
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  // ── color utilities ─────────────────────────────────────────────────────────

  function shade(hex, factor) {
    var h = hex.replace("#", "");
    if (h.length === 3) h = h[0]+h[0]+h[1]+h[1]+h[2]+h[2];
    var r = parseInt(h.slice(0,2),16);
    var g = parseInt(h.slice(2,4),16);
    var b = parseInt(h.slice(4,6),16);
    function ch(v) {
      var out = factor < 1 ? v * factor : v + (255 - v) * (factor - 1);
      return Math.max(0, Math.min(255, Math.round(out))).toString(16).padStart(2,"0");
    }
    return "#" + ch(r) + ch(g) + ch(b);
  }

  function luminance(hex) {
    var h = hex.replace("#","");
    if (h.length === 3) h = h[0]+h[0]+h[1]+h[1]+h[2]+h[2];
    var r = parseInt(h.slice(0,2),16);
    var g = parseInt(h.slice(2,4),16);
    var b = parseInt(h.slice(4,6),16);
    return (0.299*r + 0.587*g + 0.114*b) / 255;
  }

  function isDark(hex) { return luminance(hex) < 0.55; }

  function printColors(garmentHex, accentHex) {
    if (isDark(garmentHex)) return { ink: "#F7F8F2", accent: accentHex };
    var accent = luminance(accentHex) > 0.6 ? shade(accentHex, 0.42) : shade(accentHex, 0.8);
    return { ink: "#10231A", accent: accent };
  }

  // ── artwork ──────────────────────────────────────────────────────────────────

  var PRINT_FONT = "Impact,'Arial Black',Haettenschweiler,'Arial Narrow Bold',sans-serif";
  var CHAR = 0.5;

  function esc(s) {
    return String(s)
      .replace(/&/g,"&amp;")
      .replace(/</g,"&lt;")
      .replace(/>/g,"&gt;")
      .replace(/"/g,"&quot;");
  }

  function n(v) { return +v.toFixed(2); }

  function fit(text, maxWidth, maxSize) {
    var size = Math.min(maxSize, maxWidth / Math.max(text.length * CHAR, 1));
    return { size: size, width: Math.min(maxWidth, text.length * size * CHAR) };
  }

  function ballSvg(cx, cy, r, color) {
    var holes = [[0,-0.55],[0.5,-0.2],[-0.5,-0.2],[0.3,0.45],[-0.3,0.45],[0,0.05]];
    var out = '<circle cx="'+cx+'" cy="'+cy+'" r="'+r+'" fill="none" stroke="'+color+'" stroke-width="'+n(r*0.14)+'"/>';
    holes.forEach(function(h) {
      out += '<circle cx="'+n(cx+h[0]*r)+'" cy="'+n(cy+h[1]*r)+'" r="'+n(r*0.11)+'" fill="'+color+'"/>';
    });
    return out;
  }

  function textSvg(content, x, y, fill, size, width, extra) {
    extra = extra || "";
    return '<text x="'+x+'" y="'+y+'" fill="'+fill+'" font-size="'+n(size)+'" textLength="'+n(width)+'" lengthAdjust="spacingAndGlyphs" '+extra+'>'+esc(content)+'</text>';
  }

  function paddleShapeSvg(transform, ink, accent) {
    return '<g transform="'+transform+'">'+
      '<rect x="-6" y="30" width="12" height="34" rx="5" fill="'+ink+'"/>'+
      '<ellipse cx="0" cy="0" rx="30" ry="38" fill="'+ink+'"/>'+
      '<ellipse cx="0" cy="0" rx="22" ry="30" fill="none" stroke="'+accent+'" stroke-width="3"/>'+
      '</g>';
  }

  function artworkMarkup(opts) {
    var artStyle   = opts.artStyle;
    var artLine1   = opts.artLine1;
    var artLine2   = opts.artLine2;
    var ink        = opts.ink;
    var accent     = opts.accent;
    var idPrefix   = opts.idPrefix || "art";
    var fontFamily = opts.fontFamily || PRINT_FONT;
    var l1 = artLine1.toUpperCase();
    var l2 = artLine2.toUpperCase();
    var open = '<g style="font-family:'+fontFamily+';font-weight:800">';

    if (artStyle === "badge") {
      var top = fit(l1, 170, 22);
      var bot = fit(l2, 190, 18);
      return open +
        '<circle cx="150" cy="100" r="94" fill="none" stroke="'+ink+'" stroke-width="6"/>'+
        '<circle cx="150" cy="100" r="84" fill="none" stroke="'+accent+'" stroke-width="2.5"/>'+
        '<defs>'+
          '<path id="'+idPrefix+'-top" d="M 86 100 A 64 64 0 0 1 214 100"/>'+
          '<path id="'+idPrefix+'-bot" d="M 72 100 A 78 78 0 0 0 228 100"/>'+
        '</defs>'+
        '<text fill="'+ink+'" font-size="'+n(top.size)+'" letter-spacing="2" text-anchor="middle"><textPath href="#'+idPrefix+'-top" startOffset="50%">'+esc(l1)+'</textPath></text>'+
        '<text fill="'+accent+'" font-size="'+n(bot.size)+'" letter-spacing="2" text-anchor="middle"><textPath href="#'+idPrefix+'-bot" startOffset="50%">'+esc(l2)+'</textPath></text>'+
        ballSvg(150, 100, 30, accent)+
        '</g>';
    }

    if (artStyle === "paddle") {
      var a = fit(l1, 270, 64);
      var b = fit(l2, 250, 17);
      return open +
        paddleShapeSvg("translate(120 58) rotate(-28)", ink, accent)+
        paddleShapeSvg("translate(180 58) rotate(28) scale(-1 1)", ink, accent)+
        ballSvg(150, 42, 14, accent)+
        textSvg(l1, 150, 142, ink, a.size, a.width, 'text-anchor="middle"')+
        textSvg(l2, 150, 176, accent, b.size, b.width, 'text-anchor="middle"')+
        '</g>';
    }

    if (artStyle === "ball") {
      var a = fit(l1, 168, 56);
      var b = fit(l2, 168, 44);
      return open +
        ballSvg(62, 100, 50, accent)+
        textSvg(l1, 126, 98, ink, a.size, a.width)+
        '<rect x="126" y="110" width="'+n(a.width)+'" height="5" fill="'+accent+'"/>'+
        textSvg(l2, 126, 156, ink, b.size, b.width)+
        '</g>';
    }

    if (artStyle === "waves") {
      var a = fit(l1, 280, 58);
      var b = fit(l2, 250, 22);
      var wave = "M10 0 q 18 -14 36 0 t 36 0 t 36 0 t 36 0 t 36 0 t 36 0 t 36 0 t 36 0";
      return open +
        '<path d="'+wave+'" transform="translate(0 28)" fill="none" stroke="'+accent+'" stroke-width="5" stroke-linecap="round"/>'+
        '<path d="'+wave+'" transform="translate(0 46)" fill="none" stroke="'+ink+'" stroke-width="5" stroke-linecap="round"/>'+
        textSvg(l1, 150, 118, ink, a.size, a.width, 'text-anchor="middle"')+
        textSvg(l2, 150, 160, accent, b.size, b.width, 'text-anchor="middle" letter-spacing="4"')+
        '<path d="'+wave+'" transform="translate(0 182)" fill="none" stroke="'+accent+'" stroke-width="4" stroke-linecap="round"/>'+
        '</g>';
    }

    // default: wordmark
    var a = fit(l1, 284, 92);
    var b = fit(l2, 250, 26);
    var x1 = n(150 - a.width/2);
    var x2 = n(150 + a.width/2);
    return open +
      textSvg(l1, 150, 104, ink, a.size, a.width, 'text-anchor="middle"')+
      '<polygon points="'+x1+',118 '+x2+',118 '+n(x2-8)+',126 '+n(x1+8)+',126" fill="'+accent+'"/>'+
      textSvg(l2, 150, 166, ink, b.size, b.width, 'text-anchor="middle" letter-spacing="3"')+
      '</g>';
  }

  // ── shirt / cap silhouettes ───────────────────────────────────────────────────

  var SHIRT_PATHS = {
    short: "M138 34 L58 66 L8 156 L72 190 L92 150 L92 398 Q92 408 102 408 L298 408 Q308 408 308 398 L308 150 L328 190 L392 156 L342 66 L262 34 Q200 84 138 34 Z",
    long:  "M138 34 L58 66 L20 332 L66 342 L92 168 L92 398 Q92 408 102 408 L298 408 Q308 408 308 398 L308 168 L334 342 L380 332 L342 66 L262 34 Q200 84 138 34 Z",
    tank:  "M148 22 L176 22 Q200 80 224 22 L252 22 L272 130 Q300 160 300 200 L300 398 Q300 408 290 408 L110 408 Q100 408 100 398 L100 200 Q100 160 128 130 Z"
  };

  var PRINT_BOX = {
    short: { x: 120, y: 108, w: 160 },
    long:  { x: 120, y: 108, w: 160 },
    tank:  { x: 140, y: 140, w: 120 },
    cap:   { x: 144, y:  98, w: 112 }
  };

  function productMockupSvg(opts) {
    var design    = opts.design;   // { artStyle, artLine1, artLine2, accentHex, name }
    var sleeve    = opts.sleeve || "short";  // short | long | tank | cap
    var colorHex  = opts.colorHex || "#1a1a2e";
    var uid       = opts.uid || ("m" + Math.random().toString(36).slice(2,8));
    var fontFamily = opts.fontFamily;
    var isCap     = sleeve === "cap";
    var colors    = printColors(colorHex, design.accentHex);
    var edge      = shade(colorHex, 0.72);
    var box       = PRINT_BOX[sleeve];
    var h         = (box.w * 2) / 3;
    var vbox      = isCap ? "0 0 400 300" : "0 0 400 430";
    var label     = esc(design.name + " on a " + sleeve);

    var defs = '<defs><linearGradient id="'+uid+'-shine" x1="0" y1="0" x2="1" y2="1">'+
      '<stop offset="0" stop-color="#fff" stop-opacity="0.18"/>'+
      '<stop offset="0.5" stop-color="#fff" stop-opacity="0"/>'+
      '<stop offset="1" stop-color="#000" stop-opacity="0.16"/>'+
      '</linearGradient></defs>';

    var body;
    if (isCap) {
      var brim = shade(colorHex, 0.84);
      body = '<ellipse cx="200" cy="286" rx="120" ry="8" fill="#000" opacity="0.08"/>'+
        '<path d="M70 205 C66 95 128 42 200 42 C272 42 334 95 330 205 Q200 234 70 205 Z" fill="'+colorHex+'" stroke="'+edge+'" stroke-width="3" stroke-linejoin="round"/>'+
        '<path d="M200 44 L200 224" stroke="'+edge+'" stroke-width="2" fill="none" opacity="0.5"/>'+
        '<path d="M146 56 Q126 130 134 218 M254 56 Q274 130 266 218" stroke="'+edge+'" stroke-width="2" fill="none" opacity="0.35"/>'+
        '<circle cx="200" cy="44" r="8" fill="'+shade(colorHex,0.8)+'" stroke="'+edge+'" stroke-width="2"/>'+
        '<path d="M70 205 C66 95 128 42 200 42 C272 42 334 95 330 205 Q200 234 70 205 Z" fill="url(#'+uid+'-shine)"/>'+
        '<path d="M100 212 Q200 240 300 212 Q318 252 264 270 Q200 284 136 270 Q82 252 100 212 Z" fill="'+brim+'" stroke="'+edge+'" stroke-width="3" stroke-linejoin="round"/>'+
        '<path d="M112 226 Q200 252 288 226" stroke="'+edge+'" stroke-width="2" fill="none" opacity="0.45"/>';
    } else {
      var p = SHIRT_PATHS[sleeve] || SHIRT_PATHS.short;
      body = '<ellipse cx="200" cy="420" rx="130" ry="8" fill="#000" opacity="0.08"/>'+
        '<path d="M140 34 Q200 6 260 34 Q200 84 140 34 Z" fill="'+shade(colorHex,0.7)+'"/>'+
        '<path d="'+p+'" fill="'+colorHex+'" stroke="'+edge+'" stroke-width="3" stroke-linejoin="round"/>'+
        '<path d="M138 34 Q200 84 262 34" fill="none" stroke="'+edge+'" stroke-width="8" stroke-linecap="round"/>'+
        (sleeve !== "tank" ? '<path d="M92 150 L92 398 M308 150 L308 398" stroke="'+edge+'" stroke-width="1.5" opacity="0.35" fill="none"/>' : '')+
        '<path d="'+p+'" fill="url(#'+uid+'-shine)"/>';
    }

    var artInner = artworkMarkup({
      artStyle: design.artStyle,
      artLine1: design.artLine1,
      artLine2: design.artLine2,
      ink: colors.ink,
      accent: colors.accent,
      idPrefix: uid+"-art",
      fontFamily: fontFamily
    });

    var art = '<svg x="'+box.x+'" y="'+box.y+'" width="'+box.w+'" height="'+n(h)+'" viewBox="0 0 300 200" overflow="visible">'+artInner+'</svg>';

    return '<svg viewBox="'+vbox+'" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="'+label+'">'+defs+body+art+'</svg>';
  }

  return { shade: shade, luminance: luminance, printColors: printColors, artworkMarkup: artworkMarkup, productMockupSvg: productMockupSvg };
});
