# 🚀 CodeGen

**CodeGen** is an intelligent code generation tool built for **data scientists**.  
It allows users to write **natural language queries** (in English) and automatically generates relevant **data science code snippets** along with explanations, visualizations, and quality ratings.

---

## ✨ Features

- 📝 **Natural Language to Code**  
  Write queries as **comments** in the code editor, and CodeGen will suggest relevant data science code.  
  Example:  
  ```python
  # Create a bar chart of sales by region
  ```
  Hover over the comment → click **Suggest** → get the code.

- 💡 **Interactive Code Editor**  
  Powered by [CodeMirror](https://codemirror.net/), providing syntax highlighting, animations, and smooth interactions.

- 🎯 **Smart Code Suggestions**  
  - Generates **top 3 relevant code snippets** based on your query.  
  - Provides **explanations** for the generated code.  
  - Displays a **relevance rating (⭐ 1–5 stars)**.  
  - Tracks the **number of times** a snippet has been generated.

- 🔍 **Semantic Search with Embeddings**  
  - Uses **Sentence Transformers** to generate embeddings.  
  - Normalizes embeddings for both queries and code snippets.  
  - Matches query embeddings against pre-stored snippet embeddings.  
  - Returns the best matches with confidence scores.

---

## 🛠️ Tech Stack

### Frontend
- **HTML, CSS, JavaScript**
- **CodeMirror** – rich text editor for coding experience
- **Custom Animations** – interactive buttons & editor styling

### Backend
- **Flask** – lightweight Python web framework
- **Sentence Transformers** – for NLP embeddings & semantic similarity
- **Python Controllers** – handle query processing & code generation

---

## ⚙️ How It Works

1. **User writes a comment query** in the editor.  
2. **Hover → Suggest Button** appears.  
3. On click, the query is sent to the backend Flask API.  
4. **Embedding Generation**:  
   - Query → Sentence Transformer → Embedding  
   - Pre-stored snippets → Embeddings (normalized)  
5. **Similarity Search**: Top 3 most relevant snippets retrieved.  
6. **Response returned**:  
   - Generated code snippet(s)  
   - Explanation of the code  
   - Rating (1–5 ⭐ based on match score)

---

## 📸 Demo

![code-gen](https://github.com/user-attachments/assets/79033f0e-db4f-4f51-93e1-da49f9abca00)
- Full demo available at [Drive link](https://drive.google.com/file/d/1Lh29YmpCo1uTJLJfFRt2larzDWtsU2eM/view?usp=drive_link).

