// Fades [data-reveal] elements in as they enter the viewport, including elements added later
// (live data, language switches). Without JS or with reduced motion, nothing is hidden.

export function startReveal() {
  const root = document.documentElement;
  root.classList.add('js-reveal');

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-revealed');
        io.unobserve(e.target);
      });
    },
    { rootMargin: '0px 0px -10% 0px' },
  );

  const watch = (node: ParentNode) =>
    node.querySelectorAll<HTMLElement>('[data-reveal]:not(.is-revealed)').forEach((el) => io.observe(el));

  watch(document);
  const mo = new MutationObserver((records) => {
    for (const r of records) {
      r.addedNodes.forEach((n) => {
        if (!(n instanceof HTMLElement)) return;
        if (n.matches('[data-reveal]:not(.is-revealed)')) io.observe(n);
        watch(n);
      });
    }
  });
  mo.observe(document.body, { childList: true, subtree: true });

  return () => {
    io.disconnect();
    mo.disconnect();
    root.classList.remove('js-reveal');
  };
}
