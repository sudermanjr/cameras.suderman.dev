const lazyLoad = (targets, onIntersection) => {
  const observer = new IntersectionObserver((entries, self) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        onIntersection(entry.target);
        self.unobserve(entry.target);
      }
    });
  });
  targets.forEach((target) => observer.observe(target));
};

const lazyPictures = document.querySelectorAll('.lazy-picture');
lazyLoad(lazyPictures, (pictureElement) => {
  const img = pictureElement.querySelector('img');
  const sources = pictureElement.querySelectorAll('source');

  // Cleanup tasks after the image loads. Important to
  // define this handler before setting src/srcsets.
  img.onload = () => {
    pictureElement.classList.add('loaded');
    img.removeAttribute('data-src');
  };

  // Swap in the media sources
  sources.forEach((source) => {
    source.sizes = source.dataset.sizes;
    source.srcset = source.dataset.srcset;
    source.removeAttribute('data-srcset');
    source.removeAttribute('data-sizes');
  });

  // Swap in the image
  img.src = img.dataset.src;
});
