
export function loadGraph(name: string) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = `/plot/${name}/${name}.css`;
    document.head.appendChild(link);
    
    // Load JS
    const script = document.createElement('script');
    script.src = `/plot/${name}/${name}.js`;
    document.head.appendChild(script);
}