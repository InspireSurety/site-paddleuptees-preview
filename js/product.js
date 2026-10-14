(function () {
  var gallery = document.querySelector("[data-gallery]");
  if (!gallery || !window.PaddleUpMockup) return;
  var n = 0;
  document.addEventListener("change", function (event) {
    var input = event.target;
    if (!input.matches || !input.matches("[data-color]")) return;
    gallery.innerHTML = window.PaddleUpMockup.productMockupSvg({
      design: {
        name: gallery.dataset.name,
        artStyle: gallery.dataset.artStyle,
        artLine1: gallery.dataset.line1,
        artLine2: gallery.dataset.line2,
        accentHex: gallery.dataset.accent
      },
      sleeve: gallery.dataset.sleeve,
      colorHex: input.dataset.hex,
      uid: "live" + (++n),
      fontFamily: "'Barlow Condensed', Impact, 'Arial Black', sans-serif"
    });
  });
})();
