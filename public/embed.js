(function () {
  "use strict";

  // Check if config exists
  if (!window.BlueMantaChatbot) {
    console.error(
      "BlueMantaChatbot configuration not found. Please add the configuration script before this embed script."
    );
    return;
  }

  const config = window.BlueMantaChatbot;

  // Validate required config
  if (!config.chatbotId) {
    console.error("BlueMantaChatbot: chatbotId is required");
    return;
  }

  // Default configuration - now points to main app widget route
  const defaults = {
    apiBaseUrl: window.location.origin,
    theme: "light",
    primaryColor: "#3b82f6",
    greeting: "Hello! How can I help you today?",
    position: "bottom-right",
    iframeUrl: config.iframeUrl,
  };

  // Merge config with defaults
  const finalConfig = { ...defaults, ...config };

  // Create iframe URL with parameters
  const params = new URLSearchParams({
    chatbotId: finalConfig.chatbotId.toString(),
    apiBaseUrl: finalConfig.apiBaseUrl,
    theme: finalConfig.theme,
    primaryColor: finalConfig.primaryColor,
    greeting: finalConfig.greeting,
  });

  const iframeUrl = `${finalConfig.iframeUrl}?${params.toString()}`;

  // Create iframe element
  const iframe = document.createElement("iframe");
  iframe.src = iframeUrl;
  iframe.setAttribute("allowtransparency", "true");
  iframe.setAttribute("frameborder", "0");
  iframe.setAttribute("scrolling", "no");
  iframe.style.colorScheme = "light";

  // Check if device is mobile
  const isMobile = window.innerWidth < 768;

  // Base styles
  const baseStyles = {
    position: "fixed",
    border: "none",
    background: "transparent",
    zIndex: "2147483647",
    pointerEvents: "none",
    overflow: "hidden",
    transition: "all 0.3s ease",
  };

  // Mobile styles
  const mobileStyles = {
    ...baseStyles,
    top: "0",
    left: "0",
    width: "100vw",
    height: "100vh",
  };

  // Desktop styles
  const desktopStyles = {
    ...baseStyles,
    bottom: "16px",
    right: "16px",
    width: "400px",
    height: "min(500px, calc(100vh - 32px))",
    maxWidth: "calc(100vw - 32px)",
    maxHeight: "calc(100vh - 32px)",
  };

  // Apply appropriate styles
  const styles = isMobile ? mobileStyles : desktopStyles;

  Object.assign(iframe.style, styles);

  // Position the iframe based on config
  const position = finalConfig.position || "bottom-right";
  if (position.includes("left")) {
    iframe.style.right = "auto";
    iframe.style.left = "0";
  }
  if (position.includes("top")) {
    iframe.style.bottom = "auto";
    iframe.style.top = "0";
  }

  // Handle responsive behavior
  const handleResize = () => {
    const nowMobile = window.innerWidth < 768;

    if (nowMobile !== isMobile) {
      location.reload(); // Reload to apply new mobile/desktop styles
    }
  };

  // Allow pointer events for the iframe content
  iframe.onload = function () {
    iframe.style.pointerEvents = "auto";

    // Add message listener to handle various iframe events
    window.addEventListener("message", function (event) {
      // Ensure we only handle messages from our iframe
      if (event.source !== iframe.contentWindow) return;

      switch (event.data.type) {
        case "chatbot-click-outside":
          // Temporarily disable pointer events to allow click to pass through
          iframe.style.pointerEvents = "none";
          setTimeout(() => {
            iframe.style.pointerEvents = "auto";
          }, 100);
          break;

        case "chatbot-expanded":
          // Handle chat expansion - could be used for analytics
          break;

        case "chatbot-collapsed":
          // Handle chat collapse - could be used for analytics
          break;

        case "chatbot-resize":
          // Handle dynamic resizing if needed
          if (event.data.width && event.data.height) {
            iframe.style.width = event.data.width + "px";
            iframe.style.height = event.data.height + "px";
          }
          break;
      }
    });
  };

  // Add iframe to page
  const addIframe = () => {
    if (!document.querySelector("#bluemanta-chatbot-iframe")) {
      iframe.id = "bluemanta-chatbot-iframe";
      document.body.appendChild(iframe);
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", addIframe);
  } else {
    addIframe();
  }

  // Add resize handler for responsive behavior
  window.addEventListener("resize", handleResize);

  // Add CSS for better iframe integration
  const style = document.createElement("style");
  style.textContent = `
    #bluemanta-chatbot-iframe {
      opacity: 0;
      animation: fadeInIframe 0.3s ease-out 0.1s forwards;
    }
    
    @keyframes fadeInIframe {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    /* Ensure iframe doesn't interfere with page scrolling on mobile */
    @media (max-width: 767px) {
      body.chatbot-open {
        overflow: hidden;
      }
    }
  `;
  document.head.appendChild(style);

  // Store reference for potential cleanup
  window.BlueMantaChatbot.iframe = iframe;

  // Enhanced methods
  window.BlueMantaChatbot.remove = function () {
    if (iframe && iframe.parentNode) {
      iframe.parentNode.removeChild(iframe);
    }
    window.removeEventListener("resize", handleResize);
  };

  window.BlueMantaChatbot.show = function () {
    if (iframe) {
      iframe.style.display = "block";
    }
  };

  window.BlueMantaChatbot.hide = function () {
    if (iframe) {
      iframe.style.display = "none";
    }
  };

  // Add method to programmatically open/close chat
  window.BlueMantaChatbot.toggle = function () {
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.postMessage({ type: "toggle-chat" }, "*");
    }
  };
})();
