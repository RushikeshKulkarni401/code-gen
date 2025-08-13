document.addEventListener('DOMContentLoaded', function() {
    const editor = CodeMirror.fromTextArea(document.getElementById('code-editor'), {
        mode: 'python',
        lineNumbers: true,
        styleActiveLine: true,
        value: "# Existing comment 1\n# Existing comment 2"
    });

    // Copy button functionality
    const copyButton = document.querySelector('.copy-button');
    copyButton.addEventListener('click', function() {
        const code = editor.getValue();
        navigator.clipboard.writeText(code)
            .then(() => {
                const originalText = copyButton.textContent;
                copyButton.textContent = '✓ Copied!';
                setTimeout(() => {
                    copyButton.textContent = originalText;
                }, 2000);
            })
            .catch(err => {
                console.error('Failed to copy: ', err);
                copyButton.textContent = '✗ Failed';
                setTimeout(() => {
                    copyButton.textContent = '⎘ Copy';
                }, 2000);
            });
    });

    // Create suggestion button
    const suggestionBtn = document.createElement('button');
    suggestionBtn.id = 'code-suggestion-btn';
    suggestionBtn.textContent = " Suggest";
    document.body.appendChild(suggestionBtn);

    // State tracking
    let typingTimer;
    let currentCommentPos = null;
    let isTyping = false;
    const inactivityDelay = 1000; // ms
    const buttonGap = 25; // pixels
    let lastChangeTime = 0;

    // Handle typing activity
    editor.on('changes', function() {
        clearTimeout(typingTimer);
        isTyping = true;
        lastChangeTime = Date.now();
        suggestionBtn.classList.remove('visible');

        // Hide suggestions panel when typing starts
        hideSuggestionsPanel();
        
        const cursor = editor.getCursor();
        const token = editor.getTokenAt(cursor);
        const isComment = token && (token.type?.includes('comment') || token.string.startsWith('#'));
        
        if (isComment) {
            currentCommentPos = cursor;
            typingTimer = setTimeout(() => {
                isTyping = false;
                showSuggestionButton();
            }, inactivityDelay);
        } else {
            currentCommentPos = null;
        }
    });

    // Improved cursor movement handler
    editor.on('cursorActivity', function() {
        // Only consider it not typing if no changes for > inactivityDelay
        const notTyping = (Date.now() - lastChangeTime) > inactivityDelay;
        
        const cursor = editor.getCursor();
        const line = editor.getLine(cursor.line);
        const isComment = line.trim().startsWith('#');
        
        if (isComment && (notTyping || !isTyping)) {
            currentCommentPos = cursor;
            showSuggestionButton();
        } else {
            currentCommentPos = null;
            suggestionBtn.classList.remove('visible');
        }
    });

    function showSuggestionButton() {
        if (!currentCommentPos) return;
        const cursorCoords = editor.cursorCoords(currentCommentPos, "page");
        suggestionBtn.style.left = `${cursorCoords.right + buttonGap}px`;
        suggestionBtn.style.top = `${cursorCoords.top}px`;
        suggestionBtn.classList.add('visible');
    }

    // Handle button click
    suggestionBtn.addEventListener('click', function() {
        if (currentCommentPos) {
            const token = editor.getTokenAt(currentCommentPos);
            if (token) {
                showSuggestionsPanel(token.string);
            }
        }
    });

    // suggestions section
    function showSuggestionsPanel(commentText) {
        const panel = document.querySelector('.suggestions-panel');
        panel.classList.add('visible');
        
        // Mock API call - replace with actual implementation
        fetchSuggestions(commentText).then(suggestions => {
            renderSuggestions(suggestions);
        });
    }

    function hideSuggestionsPanel() {
    const panel = document.querySelector('.suggestions-panel');
    const container = document.querySelector('.suggestions-container');
    
    // Reset to loading state before hiding
    container.innerHTML = `
        <div class="suggestion-item loading-state">
            <div class="suggestion-code">
                <div class="code-line-shimmer"></div>
                <div class="code-line-shimmer" style="width: 80%"></div>
                <div class="code-line-shimmer" style="width: 60%"></div>
                <div class="code-line-shimmer" style="width: 90%"></div>
            </div>
            <div class="suggestion-actions">
                <button class="insert-btn" disabled>Insert</button>
                <button class="copy-btn" disabled>Copy</button>
            </div>
        </div>
        <div class="suggestion-item loading-state">
            <div class="suggestion-code">
                <div class="code-line-shimmer"></div>
                <div class="code-line-shimmer"></div>
                <div class="code-block-shimmer"></div>
            </div>
            <div class="suggestion-actions">
                <button class="insert-btn" disabled>Insert</button>
                <button class="copy-btn" disabled>Copy</button>
            </div>
        </div>`;
    
        // Hide the panel
        panel.classList.remove('visible');
    }

    function fetchSuggestions(commentText) {
        // Replace with actual API call
        return new Promise(resolve => {
            setTimeout(() => {
                resolve([{
                    code: `# Optimized version based on: "${commentText}"\ndef calculate_stats(data):\n    return {\n        'mean': sum(data)/len(data),\n        'max': max(data),\n        'min': min(data)\n    }`,
                    explanation: "This optimized version calculates multiple statistics in a single pass"
                }, {
                    code: `# Optimized version based on: "${commentText}"\ndef calculate_stats(data):\n    return {\n        'mean': sum(data)/len(data),\n        'max': max(data),\n        'min': min(data)\n    }`,
                    explanation: "This optimized version calculates multiple statistics in a single pass"
                }]);
            }, 800);
        });
    }

    function renderSuggestions(suggestions) {
        const container = document.querySelector('.suggestions-container');
        container.innerHTML = '';
        
        suggestions.forEach(suggestion => {
            const item = document.createElement('div');
            item.className = 'suggestion-item';
            item.innerHTML = `
                <div class="suggestion-code">
                    <pre><code>${suggestion.code}</code></pre>
                </div>
                <div class="suggestion-actions">
                    <button class="insert-btn">Insert</button>
                    <button class="copy-btn">Copy</button>
                </div>
            `;
            container.appendChild(item);
        });
        
        // Add event listeners
        document.querySelectorAll('.insert-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const code = this.closest('.suggestion-item').querySelector('code').textContent;
                insertCodeAtCursor(code);
                hideSuggestionsPanel();
            });
        });
        
        document.querySelectorAll('.copy-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const code = this.closest('.suggestion-item').querySelector('code').textContent;
                navigator.clipboard.writeText(code);
                hideSuggestionsPanel();
            });
        });
    }

    function insertCodeAtCursor(code) {
        const cursor = editor.getCursor();
        editor.replaceRange(code, cursor);
    }

    // Close button
    document.querySelector('.close-btn').addEventListener('click', function() {
        document.querySelector('.suggestions-panel').classList.remove('visible');
    });
});