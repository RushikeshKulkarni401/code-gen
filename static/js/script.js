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
    /*
    async function fetchSuggestions(commentText) {
        try {
            const response = await fetch('http://127.0.0.1:5000/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    query: commentText  // Changed from 'comment' to 'query' to match your Flask endpoint
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log("API response data:", data);
            
            // Transform the API response to match our expected format
            const suggestions = data.map(item => ({
                code: item.body || item.code,  // Use 'body' from API or fallback to 'code'
                explanation: item.summary || item.explanation  // Use 'summary' from API or fallback to 'explanation'
            }));

            return suggestions;
        } catch (error) {
            console.error('Error fetching suggestions:', error);
            return []; // Return empty array on error
        }
    }

    function renderSuggestions(suggestions) {
        const container = document.querySelector('.suggestions-container');
        container.innerHTML = '';
        
        suggestions.forEach(suggestion => {
            console.log("Suggestion", suggestion);
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
    }*/
    async function fetchSuggestions(commentText) {
        try {
            const response = await fetch('http://127.0.0.1:5000/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    query: commentText
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log("API response data:", data);
            
            // Transform API response to include all metadata
            const suggestions = data.map(item => ({
                code: item.body || item.code,
                explanation: item.summary || item.explanation || 'No explanation provided',
                tags: item.tags || ['general'],  // Default tag if none provided
                score: item.score !== undefined ? item.score : null  // Handle missing score
            }));

            return suggestions;
        } catch (error) {
            console.error('Error fetching suggestions:', error);
            return [];
        }
    }

    function renderSuggestions(suggestions) {
        const container = document.querySelector('.suggestions-container');
        container.innerHTML = '';
        
        if (suggestions.length === 0) {
            container.innerHTML = '<div class="no-suggestions">No suggestions found</div>';
            return;
        }

        suggestions.forEach(suggestion => {
            const item = document.createElement('div');
            item.className = 'suggestion-item';
            
            // Create info button (no separate header)
            const infoBtn = document.createElement('button');
            infoBtn.className = 'info-btn';
            infoBtn.innerHTML = '<span class="info-icon"></span>';
            item.appendChild(infoBtn);
            
            // Create code block
            const codeBlock = document.createElement('div');
            codeBlock.className = 'suggestion-code';
            const pre = document.createElement('pre');
            const code = document.createElement('code');
            code.textContent = suggestion.code;
            pre.appendChild(code);
            codeBlock.appendChild(pre);
            
            // Create metadata panel (initially hidden)
            const metaPanel = document.createElement('div');
            metaPanel.className = 'meta-panel hidden';
            
            if (suggestion.explanation) {
                const explanation = document.createElement('div');
                explanation.className = 'meta-explanation';
                explanation.textContent = suggestion.explanation;
                metaPanel.appendChild(explanation);
            }
            
            
            if (suggestion.score !== undefined && suggestion.score !== null) {
                const score = document.createElement('div');
                score.className = 'meta-score';
                score.innerHTML = `<strong>Quality Score:</strong> ${renderScoreStars(suggestion.score)}`;
                metaPanel.appendChild(score);
            }

            if (suggestion.tags && suggestion.tags.length > 0) {
                const tags = document.createElement('div');
                tags.className = 'meta-tags';
                tags.innerHTML = suggestion.tags.map(tag => 
                    `<span class="tag">${tag}</span>`
                ).join(' ');
                metaPanel.appendChild(tags);
            }
            
            // Create action buttons
            const actions = document.createElement('div');
            actions.className = 'suggestion-actions';
            const insertBtn = document.createElement('button');
            insertBtn.className = 'insert-btn';
            insertBtn.textContent = 'Insert';
            const copyBtn = document.createElement('button');
            copyBtn.className = 'copy-btn';
            copyBtn.textContent = 'Copy';
            
            actions.append(insertBtn, copyBtn);
            item.append(codeBlock, metaPanel, actions);
            container.appendChild(item);

            // Add event listeners
            infoBtn.addEventListener('click', () => {
                metaPanel.classList.toggle('active');
                infoBtn.classList.toggle('active');
            });
            
            insertBtn.addEventListener('click', () => insertCode(suggestion.code));
            copyBtn.addEventListener('click', () => copyToClipboard(copyBtn, suggestion.code));
        });
    }

    function renderScoreStars(score) {
        const maxStars = 5;
        let stars = '';
        for (let i = 1; i <= maxStars; i++) {
            const filled = i <= Math.round(score);
            stars += `<span class="star ${filled ? 'filled' : ''}">${filled ? '★' : '☆'}</span>`;
        }
        return `<span class="score-stars">${stars}</span>`;
    }

    // Helper functions remain the same
    function insertCode(code) {
        console.log('Inserting code:', code);
        insertCodeAtCursor();
        hideSuggestionsPanel();
    }

    function copyToClipboard(copyBtn, text) {
        navigator.clipboard.writeText(text)
            .then(() => {
                const originalText = copyBtn.textContent;
                copyBtn.textContent = 'Copied!';
                setTimeout(() => {
                    copyBtn.textContent = originalText;
                }, 2000);
            })
            .catch(err => console.error('Failed to copy code:', err));
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