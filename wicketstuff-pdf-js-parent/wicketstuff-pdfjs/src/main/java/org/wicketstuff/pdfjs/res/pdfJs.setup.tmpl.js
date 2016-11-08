;(function ($, undefined) {

    'use strict';

    if (typeof(Wicket) === 'object' && typeof(Wicket.PDFJS) === 'object') {
        return;
    }

    Wicket.PDFJS = {
        Topic: {
            TOTAL_PAGES: 'Wicket.PDFJS.TotalPages',
            NEXT_PAGE: 'Wicket.PDFJS.NextPage',
            PREVIOUS_PAGE: 'Wicket.PDFJS.PreviousPage'
        }
    };

    //
    // If absolute URL from the remote server is provided, configure the CORS
    // header on that server.
    //
    var url = '${pdfDocumentUrl}';
    //
    // Disable workers to avoid yet another cross-origin issue (workers need
    // the URL of the script to be loaded, and dynamically loading a cross-origin
    // script does not work).
    PDFJS.disableWorker = ${pdfWorkerDisabled};
    PDFJS.workerSrc = '${pdfWorkerUrl}';

    var pdfDoc = null,
        pageNum = ${initialPage},
        pageRendering = false,
        pageNumPending = null,
        scale = ${initialScale},
        canvas = document.getElementById('${pdfCanvasId}'),
        ctx = canvas.getContext('2d');

    /**
     * Get page info from document, resize canvas accordingly, and render page.
     * @param num Page number.
     */
    function renderPage(num) {
        pageRendering = true;
        // Using promise to fetch the page
        pdfDoc.getPage(num).then(function(page) {
            var viewport = page.getViewport(scale);
            canvas.height = viewport.height;
            canvas.width = viewport.width;
            // Render PDF page into canvas context
            var renderContext = {
                canvasContext: ctx,
                viewport: viewport
            };
            var renderTask = page.render(renderContext);
            // Wait for rendering to finish
            renderTask.promise.then(function () {
                pageRendering = false;
                if (pageNumPending !== null) {
                    // New page rendering is pending
                    renderPage(pageNumPending);
                    pageNumPending = null;
                }
            });
        });
        // Update page counters
        document.getElementById('page_num').textContent = pageNum;
    }
    /**
     * If another page rendering in progress, waits until the rendering is
     * finished. Otherwise, executes rendering immediately.
     */
    function queueRenderPage(num) {
        if (pageRendering) {
            pageNumPending = num;
        } else {
            renderPage(num);
        }
    }

    /**
     * Displays previous page.
     */
    Wicket.Event.subscribe(Wicket.PDFJS.Topic.PREVIOUS_PAGE, function () {
        if (pageNum <= 1) {
            return;
        }
        pageNum--;
        queueRenderPage(pageNum);
    });

    /**
     * Displays next page.
     */
    Wicket.Event.subscribe(Wicket.PDFJS.Topic.NEXT_PAGE, function () {
        if (pageNum >= pdfDoc.numPages) {
            return;
        }
        pageNum++;
        queueRenderPage(pageNum);
    });

    /**
     * Asynchronously downloads PDF.
     */
    PDFJS.getDocument(url).then(function (pdfDoc_) {
        pdfDoc = pdfDoc_;
        Wicket.Event.publish(Wicket.PDFJS.Topic.TOTAL_PAGES, pdfDoc.numPages);
        // document.getElementById('page_count').textContent = pdfDoc.numPages;
        // Initial/first page rendering
        renderPage(pageNum);
    });
})(jQuery);
