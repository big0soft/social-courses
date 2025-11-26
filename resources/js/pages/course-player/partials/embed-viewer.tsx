import { HTMLAttributes, useEffect, useRef } from 'react';

interface Props extends HTMLAttributes<HTMLIFrameElement> {
   src: string;
}

const EmbedViewer = (props: Props) => {
   const containerRef = useRef<HTMLDivElement>(null);

   useEffect(() => {
      if (!containerRef.current || !props.src) return;

      // Clear previous content
      containerRef.current.innerHTML = '';

      // Create a temporary div to parse the HTML safely
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = props.src;

      // Only extract iframe elements (safer than rendering arbitrary HTML)
      const iframe = tempDiv.querySelector('iframe');

      if (iframe) {
         // Clone the iframe to avoid XSS from event handlers
         const safeIframe = document.createElement('iframe');
         safeIframe.src = iframe.src;
         safeIframe.style.width = '100%';
         safeIframe.style.height = '100%';
         safeIframe.style.border = 'none';
         safeIframe.setAttribute('allowfullscreen', 'true');
         safeIframe.setAttribute('frameborder', '0');

         containerRef.current.appendChild(safeIframe);
      } else {
         // If no iframe found, log warning
         console.warn('Embed code does not contain an iframe element');
      }
   }, [props.src]);

   return (
      <div
         ref={containerRef}
         className="relative h-full w-full overflow-hidden"
      />
   );
};

export default EmbedViewer;
