// Mermaid Live Editor - JavaScript
class MermaidEditor {
    constructor() {
        this.currentZoom = 2; // Zoom por defecto (1.0)
        this.viewMode = 'split'; // split, editor, preview
        this.isFullscreen = false;
        this.debounceTimer = null;
        this.lastValidCode = '';
        
        this.init();
    }

    init() {
        this.initMermaid();
        this.bindEvents();
        this.updateStatus();
        this.loadExampleTemplates();
        
        // Cargar código de ejemplo por defecto
        this.loadDefaultExample();
    }

    initMermaid() {
        // Configuración de Mermaid con tema pistache suave
        mermaid.initialize({
            startOnLoad: false,
            theme: 'dark',
            securityLevel: 'loose',
            fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
            themeVariables: {
                // Colores principales - Verde pistache suave
                primaryColor: '#9db88a',
                primaryTextColor: '#b8d4a8',
                primaryBorderColor: '#9db88a',
                
                // Colores secundarios
                secondaryColor: '#7a9b6b',
                tertiaryColor: '#6b8e5a',
                
                // Fondos - Negro suave
                background: '#0f0f0f',
                mainBkg: '#1a1a1a',
                secondBkg: '#262626',
                tertiaryBkg: '#0f0f0f',
                
                // Textos - Verde pistache
                textColor: '#b8d4a8',
                lineColor: '#9db88a',
                sectionBkgColor: '#1a1a1a',
                altSectionBkgColor: '#262626',
                gridColor: '#374151',
                
                // Nodos y formas
                nodeBkg: '#1a1a1a',
                nodeBorder: '#9db88a',
                clusterBkg: '#262626',
                clusterBorder: '#7a9b6b',
                
                // Estados especiales
                activeTaskBkgColor: '#9db88a',
                activeTaskBorderColor: '#7a9b6b',
                
                // Colores de relaciones
                relationColor: '#9db88a',
                relationLabelBackground: '#1a1a1a',
                relationLabelColor: '#b8d4a8',
                
                // Colores específicos para diferentes elementos
                cScale0: '#9db88a',
                cScale1: '#7a9b6b',
                cScale2: '#6b8e5a',
                cScale3: '#8faa7d',
                cScale4: '#a5c294',
                pie1: '#9db88a',
                pie2: '#7a9b6b',
                pie3: '#6b8e5a',
                pie4: '#8faa7d',
                pie5: '#a5c294',
                pie6: '#b8d4a8',
                
                // Colores adicionales para mejor variedad
                actor0: '#9db88a',
                actor1: '#7a9b6b',
                actor2: '#6b8e5a',
                actorBkg0: '#1a1a1a',
                actorBkg1: '#262626',
                actorBkg2: '#1a1a1a'
            },
            flowchart: {
                useMaxWidth: true,
                htmlLabels: true,
                curve: 'basis'
            },
            sequence: {
                diagramMarginX: 50,
                diagramMarginY: 10,
                actorMargin: 50,
                width: 150,
                height: 65,
                boxMargin: 10,
                boxTextMargin: 5,
                noteMargin: 10,
                messageMargin: 35,
                mirrorActors: true,
                bottomMarginAdj: 1,
                useMaxWidth: true
            },
            gantt: {
                titleTopMargin: 25,
                barHeight: 20,
                fontFamily: 'Segoe UI',
                fontSize: 11,
                gridLineStartPadding: 35,
                bottomPadding: 25,
                leftPadding: 75,
                topPadding: 50,
                rightPadding: 25
            }
        });
    }

    bindEvents() {
        // Referencias a elementos
        this.elements = {
            mermaidCode: document.getElementById('mermaidCode'),
            mermaidOutput: document.getElementById('mermaidOutput'),
            fileInput: document.getElementById('fileInput'),
            imageInput: document.getElementById('imageInput'),
            loadFileBtn: document.getElementById('loadFileBtn'),
            loadImageBtn: document.getElementById('loadImageBtn'),
            downloadBtn: document.getElementById('downloadBtn'),
            clearBtn: document.getElementById('clearBtn'),
            toggleViewBtn: document.getElementById('toggleViewBtn'),
            fullscreenBtn: document.getElementById('fullscreenBtn'),
            refreshBtn: document.getElementById('refreshBtn'),
            exportImageBtn: document.getElementById('exportImageBtn'),
            zoomInBtn: document.getElementById('zoomInBtn'),
            zoomOutBtn: document.getElementById('zoomOutBtn'),
            resetZoomBtn: document.getElementById('resetZoomBtn'),
            diagramType: document.getElementById('diagramType'),
            statusText: document.getElementById('statusText'),
            lineCount: document.getElementById('lineCount'),
            charCount: document.getElementById('charCount'),
            editorPanel: document.getElementById('editorPanel'),
            previewPanel: document.getElementById('previewPanel'),
            examplesSection: document.getElementById('examplesSection')
        };

        // Event listeners
        this.elements.mermaidCode.addEventListener('input', () => this.handleCodeChange());
        this.elements.mermaidCode.addEventListener('keydown', (e) => this.handleKeyDown(e));
        
        this.elements.loadFileBtn.addEventListener('click', () => this.elements.fileInput.click());
        this.elements.fileInput.addEventListener('change', (e) => this.handleFileLoad(e));
        
        this.elements.loadImageBtn.addEventListener('click', () => this.elements.imageInput.click());
        this.elements.imageInput.addEventListener('change', (e) => this.handleImageLoad(e));
        
        this.elements.downloadBtn.addEventListener('click', () => this.downloadCode());
        this.elements.clearBtn.addEventListener('click', () => this.clearEditor());
        
        this.elements.toggleViewBtn.addEventListener('click', () => this.toggleView());
        this.elements.fullscreenBtn.addEventListener('click', () => this.toggleFullscreen());
        
        this.elements.refreshBtn.addEventListener('click', () => this.renderDiagram());
        this.elements.exportImageBtn.addEventListener('click', () => this.exportAsImage());
        this.elements.zoomInBtn.addEventListener('click', () => this.zoomIn());
        this.elements.zoomOutBtn.addEventListener('click', () => this.zoomOut());
        this.elements.resetZoomBtn.addEventListener('click', () => this.resetZoom());
        
        this.elements.diagramType.addEventListener('change', (e) => this.insertTemplate(e.target.value));

        // Event listeners para ejemplos
        document.querySelectorAll('.example-card').forEach(card => {
            card.addEventListener('click', () => {
                const code = card.querySelector('pre').textContent;
                this.elements.mermaidCode.value = code;
                this.handleCodeChange();
                this.scrollToEditor();
            });
        });

        // Atajos de teclado
        document.addEventListener('keydown', (e) => this.handleGlobalKeyDown(e));

        // Eventos de redimensionamiento
        window.addEventListener('resize', () => this.handleResize());
    }

    handleCodeChange() {
        clearTimeout(this.debounceTimer);
        this.debounceTimer = setTimeout(() => {
            this.renderDiagram();
            this.updateStatus();
        }, 500); // Debounce de 500ms
    }

    handleKeyDown(e) {
        // Tab para indentación
        if (e.key === 'Tab') {
            e.preventDefault();
            const start = e.target.selectionStart;
            const end = e.target.selectionEnd;
            const value = e.target.value;
            
            if (e.shiftKey) {
                // Shift+Tab para des-indentar
                const lineStart = value.lastIndexOf('\n', start - 1) + 1;
                const lineText = value.substring(lineStart, start);
                if (lineText.startsWith('  ')) {
                    e.target.value = value.substring(0, lineStart) + 
                                   lineText.substring(2) + 
                                   value.substring(start);
                    e.target.selectionStart = e.target.selectionEnd = start - 2;
                }
            } else {
                // Tab para indentar
                e.target.value = value.substring(0, start) + '  ' + value.substring(end);
                e.target.selectionStart = e.target.selectionEnd = start + 2;
            }
            
            this.handleCodeChange();
        }
    }

    handleGlobalKeyDown(e) {
        // Ctrl+S para descargar
        if (e.ctrlKey && e.key === 's') {
            e.preventDefault();
            this.downloadCode();
        }
        
        // Ctrl+O para cargar archivo
        if (e.ctrlKey && e.key === 'o') {
            e.preventDefault();
            this.elements.fileInput.click();
        }
        
        // F11 para pantalla completa
        if (e.key === 'F11') {
            e.preventDefault();
            this.toggleFullscreen();
        }
        
        // Escape para salir de pantalla completa
        if (e.key === 'Escape' && this.isFullscreen) {
            this.toggleFullscreen();
        }
    }

    async renderDiagram() {
        const code = this.elements.mermaidCode.value.trim();
        
        if (!code) {
            this.showPlaceholder();
            return;
        }

        try {
            this.setStatus('Renderizando...', 'info');
            this.elements.mermaidOutput.innerHTML = '<div class="loading">Generando diagrama...</div>';

            // Generar ID único para el diagrama
            const diagramId = 'mermaid-diagram-' + Date.now();
            
            // Renderizar el diagrama directamente - Mermaid maneja la validación
            const { svg } = await mermaid.render(diagramId, code);
            
            this.elements.mermaidOutput.innerHTML = svg;
            this.applyZoom();
            this.lastValidCode = code;
            this.setStatus('Diagrama renderizado correctamente', 'success');
            
            // Añadir clase de animación
            this.elements.mermaidOutput.classList.add('fade-in');
            setTimeout(() => {
                this.elements.mermaidOutput.classList.remove('fade-in');
            }, 300);

        } catch (error) {
            console.error('Error rendering diagram:', error);
            this.showError(this.getErrorMessage(error));
            this.setStatus('Error en el diagrama', 'error');
        }
    }

    getErrorMessage(error) {
        // Extraer mensaje de error más útil
        if (error.message) {
            return error.message;
        }
        if (error.toString) {
            return error.toString();
        }
        return 'Error desconocido al renderizar el diagrama';
    }

    showError(message) {
        this.elements.mermaidOutput.innerHTML = `
            <div class="error-state">
                <h4>❌ Error en el diagrama</h4>
                <p>${message}</p>
                <p><small>Revisa la sintaxis de Mermaid o consulta los ejemplos.</small></p>
            </div>
        `;
    }

    showPlaceholder() {
        this.elements.mermaidOutput.innerHTML = `
            <div class="placeholder">
                <p>🎨 Los diagramas aparecerán aquí</p>
                <p>Escribe código Mermaid en el editor o carga un archivo</p>
            </div>
        `;
        this.setStatus('Listo', 'ready');
    }

    handleFileLoad(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            this.elements.mermaidCode.value = e.target.result;
            this.handleCodeChange();
            this.setStatus(`Archivo "${file.name}" cargado`, 'success');
        };
        
        reader.onerror = () => {
            this.setStatus('Error al cargar el archivo', 'error');
        };
        
        reader.readAsText(file);
        
        // Limpiar el input para permitir cargar el mismo archivo nuevamente
        event.target.value = '';
    }

    handleImageLoad(event) {
        const file = event.target.files[0];
        if (!file) return;

        // Verificar que sea una imagen
        if (!file.type.startsWith('image/')) {
            this.setStatus('Por favor selecciona un archivo de imagen válido', 'error');
            return;
        }

        this.setStatus('Analizando imagen...', 'info');

        const reader = new FileReader();
        reader.onload = (e) => {
            this.analyzeImageAndGenerateCode(e.target.result, file.name);
        };
        
        reader.onerror = () => {
            this.setStatus('Error al cargar la imagen', 'error');
        };
        
        reader.readAsDataURL(file);
        
        // Limpiar el input
        event.target.value = '';
    }

    async analyzeImageAndGenerateCode(imageDataUrl, fileName) {
        try {
            // Crear elemento de imagen para análisis
            const img = new Image();
            img.onload = () => {
                // Analizar la imagen y generar código Mermaid
                const generatedCode = this.generateMermaidFromImage(img, fileName);
                
                // Insertar el código generado en el editor
                this.elements.mermaidCode.value = generatedCode;
                this.handleCodeChange();
                this.setStatus(`Código Mermaid generado desde "${fileName}"`, 'success');
                this.scrollToEditor();
            };
            
            img.onerror = () => {
                this.setStatus('Error al procesar la imagen', 'error');
            };
            
            img.src = imageDataUrl;
            
        } catch (error) {
            console.error('Error analyzing image:', error);
            this.setStatus('Error al analizar la imagen', 'error');
        }
    }

    generateMermaidFromImage(img, fileName) {
        // Crear canvas para análisis de la imagen
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Redimensionar para análisis (más pequeño para mejor rendimiento)
        const maxSize = 200;
        const scale = Math.min(maxSize / img.width, maxSize / img.height);
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        // Obtener datos de la imagen
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        // Análisis básico de la imagen
        const analysis = this.analyzeImageStructure(data, canvas.width, canvas.height);
        
        // Generar código Mermaid basado en el análisis
        return this.createMermaidCodeFromAnalysis(analysis, fileName);
    }

    analyzeImageStructure(data, width, height) {
        let brightPixels = 0;
        let darkPixels = 0;
        let colorRegions = [];
        let edges = 0;
        
        // Análisis de píxeles
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const brightness = (r + g + b) / 3;
            
            if (brightness > 128) {
                brightPixels++;
            } else {
                darkPixels++;
            }
            
            // Detectar bordes simples (cambios bruscos de color)
            if (i > width * 4 && Math.abs(brightness - (data[i - width * 4] + data[i - width * 4 + 1] + data[i - width * 4 + 2]) / 3) > 50) {
                edges++;
            }
        }
        
        // Determinar tipo de diagrama basado en características
        const totalPixels = brightPixels + darkPixels;
        const brightnessRatio = brightPixels / totalPixels;
        const edgeRatio = edges / totalPixels;
        
        return {
            brightnessRatio,
            edgeRatio,
            width,
            height,
            aspectRatio: width / height,
            totalPixels,
            edges
        };
    }

    createMermaidCodeFromAnalysis(analysis, fileName) {
        const { brightnessRatio, edgeRatio, aspectRatio, edges } = analysis;
        
        // Generar código basado en las características detectadas
        let code = '';
        
        if (edgeRatio > 0.1 && aspectRatio > 1.2) {
            // Imagen horizontal con muchos bordes - probablemente un flowchart
            code = `flowchart LR
    A["Imagen: ${fileName}"] --> B[Análisis Completado]
    B --> C{Tipo Detectado}
    C -->|Horizontal| D[Proceso Lineal]
    C -->|Bordes Definidos| E[Estructura Clara]
    D --> F[Resultado]
    E --> F
    
    style A fill:#e1f5fe
    style F fill:#e8f5e8
    style C fill:#fff3e0`;
        } else if (aspectRatio < 0.8 && edges > analysis.totalPixels * 0.05) {
            // Imagen vertical con estructura - posible diagrama de secuencia
            code = `sequenceDiagram
    participant U as Usuario
    participant S as Sistema
    participant I as Imagen: ${fileName}
    
    U->>S: Cargar imagen
    S->>I: Analizar contenido
    I-->>S: Estructura detectada
    S-->>U: Código generado
    
    Note over I: Aspectos detectados:<br/>- Orientación vertical<br/>- Bordes definidos<br/>- Estructura secuencial`;
        } else if (brightnessRatio > 0.7) {
            // Imagen clara - posible diagrama de estado
            code = `stateDiagram-v2
    [*] --> ImagenCargada
    ImagenCargada --> Analizando : procesar
    Analizando --> Completado : análisis exitoso
    Analizando --> Error : fallo en análisis
    Completado --> [*]
    Error --> ImagenCargada : reintentar
    
    note right of Completado
        Imagen: ${fileName}
        Brillo: ${Math.round(brightnessRatio * 100)}%
        Estructura: Clara
    end note`;
        } else {
            // Caso general - crear un diagrama conceptual
            code = `mindmap
  root((Análisis de Imagen))
    Archivo
      ${fileName}
    Características
      Brillo: ${Math.round(brightnessRatio * 100)}%
      Bordes: ${Math.round(edgeRatio * 100)}%
      Aspecto: ${aspectRatio.toFixed(2)}
    Interpretación
      Estructura Detectada
      Código Generado
      Listo para Editar`;
        }
        
        // Añadir comentario explicativo
        const comment = `%% Código generado automáticamente desde: ${fileName}
%% Análisis de imagen:
%% - Brillo promedio: ${Math.round(brightnessRatio * 100)}%
%% - Densidad de bordes: ${Math.round(edgeRatio * 100)}%
%% - Relación de aspecto: ${aspectRatio.toFixed(2)}
%% 
%% Puedes editar este código para ajustarlo a tus necesidades

`;
        
        return comment + code;
    }

    downloadCode() {
        const code = this.elements.mermaidCode.value;
        if (!code.trim()) {
            this.setStatus('No hay código para descargar', 'warning');
            return;
        }

        const blob = new Blob([code], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        
        a.href = url;
        a.download = 'mermaid-diagram.mmd';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.setStatus('Archivo descargado', 'success');
    }

    clearEditor() {
        if (confirm('¿Estás seguro de que quieres limpiar el editor?')) {
            this.elements.mermaidCode.value = '';
            this.showPlaceholder();
            this.updateStatus();
            this.setStatus('Editor limpiado', 'info');
        }
    }

    toggleView() {
        const modes = ['split', 'editor', 'preview'];
        const currentIndex = modes.indexOf(this.viewMode);
        this.viewMode = modes[(currentIndex + 1) % modes.length];
        
        const container = document.querySelector('.container');
        container.className = container.className.replace(/view-\w+-only/g, '');
        
        switch (this.viewMode) {
            case 'editor':
                container.classList.add('view-preview-only');
                this.elements.toggleViewBtn.textContent = '👁️ Solo Vista Previa';
                break;
            case 'preview':
                container.classList.add('view-editor-only');
                this.elements.toggleViewBtn.textContent = '📝 Solo Editor';
                break;
            default:
                this.elements.toggleViewBtn.textContent = '🔄 Vista Dividida';
        }
    }

    toggleFullscreen() {
        this.isFullscreen = !this.isFullscreen;
        const container = document.querySelector('.container');
        
        if (this.isFullscreen) {
            container.classList.add('fullscreen-mode');
            this.elements.fullscreenBtn.textContent = '🔙 Salir';
        } else {
            container.classList.remove('fullscreen-mode');
            this.elements.fullscreenBtn.textContent = '🖥️ Pantalla Completa';
        }
    }

    zoomIn() {
        if (this.currentZoom < 4) {
            this.currentZoom++;
            this.applyZoom();
        }
    }

    zoomOut() {
        if (this.currentZoom > 1) {
            this.currentZoom--;
            this.applyZoom();
        }
    }

    resetZoom() {
        this.currentZoom = 2;
        this.applyZoom();
    }

    applyZoom() {
        const diagram = this.elements.mermaidOutput.querySelector('svg');
        if (diagram) {
            // Remover clases de zoom anteriores
            diagram.classList.remove('zoom-1', 'zoom-2', 'zoom-3', 'zoom-4');
            // Añadir nueva clase de zoom
            diagram.classList.add(`zoom-${this.currentZoom}`);
        }
    }

    insertTemplate(type) {
        if (!type) return;

        const templates = {
            flowchart: `flowchart TD
    A[Inicio] --> B{¿Condición?}
    B -->|Sí| C[Proceso 1]
    B -->|No| D[Proceso 2]
    C --> E[Fin]
    D --> E`,
            
            sequence: `sequenceDiagram
    participant A as Usuario
    participant B as Sistema
    participant C as Base de Datos
    
    A->>B: Solicitud
    B->>C: Consulta
    C-->>B: Respuesta
    B-->>A: Resultado`,
            
            class: `classDiagram
    class Animal {
        +String name
        +int age
        +eat()
        +sleep()
    }
    
    class Dog {
        +String breed
        +bark()
    }
    
    Animal <|-- Dog`,
            
            state: `stateDiagram-v2
    [*] --> Inactivo
    Inactivo --> Activo : iniciar
    Activo --> Procesando : procesar
    Procesando --> Activo : completar
    Activo --> Inactivo : detener
    Inactivo --> [*]`,
            
            er: `erDiagram
    USUARIO ||--o{ PEDIDO : realiza
    PEDIDO ||--|{ ITEM_PEDIDO : contiene
    PRODUCTO ||--o{ ITEM_PEDIDO : incluye
    
    USUARIO {
        int id PK
        string nombre
        string email
    }
    
    PEDIDO {
        int id PK
        date fecha
        int usuario_id FK
    }`,
            
            gantt: `gantt
    title Cronograma del Proyecto
    dateFormat  YYYY-MM-DD
    section Planificación
    Análisis       :a1, 2024-01-01, 30d
    Diseño         :a2, after a1, 20d
    section Desarrollo
    Frontend       :b1, after a2, 45d
    Backend        :b2, after a2, 40d
    section Testing
    Pruebas        :c1, after b1, 15d`,
            
            pie: `pie title Distribución de Ventas
    "Producto A" : 386
    "Producto B" : 85
    "Producto C" : 150
    "Producto D" : 50`,
            
            journey: `journey
    title Experiencia del Usuario
    section Registro
      Visitar sitio: 5: Usuario
      Crear cuenta: 3: Usuario
      Verificar email: 4: Usuario
    section Compra
      Buscar producto: 4: Usuario
      Añadir al carrito: 5: Usuario
      Pagar: 3: Usuario`,
            
            git: `gitGraph
    commit
    branch develop
    checkout develop
    commit
    commit
    checkout main
    merge develop
    commit`
        };

        if (templates[type]) {
            this.elements.mermaidCode.value = templates[type];
            this.handleCodeChange();
            this.elements.diagramType.value = '';
        }
    }

    updateStatus() {
        const code = this.elements.mermaidCode.value;
        const lines = code.split('\n').length;
        const chars = code.length;
        
        this.elements.lineCount.textContent = `Líneas: ${lines}`;
        this.elements.charCount.textContent = `Caracteres: ${chars}`;
    }

    setStatus(message, type = 'info') {
        this.elements.statusText.textContent = message;
        this.elements.statusText.className = `status-${type}`;
        
        // Auto-limpiar el estado después de 3 segundos
        setTimeout(() => {
            if (this.elements.statusText.textContent === message) {
                this.elements.statusText.textContent = 'Listo';
                this.elements.statusText.className = '';
            }
        }, 3000);
    }

    scrollToEditor() {
        this.elements.mermaidCode.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
        });
        this.elements.mermaidCode.focus();
    }

    handleResize() {
        // Reajustar el diagrama en caso de cambio de tamaño
        if (this.elements.mermaidOutput.querySelector('svg')) {
            this.applyZoom();
        }
    }

    loadExampleTemplates() {
        // Esta función se puede usar para cargar plantillas adicionales dinámicamente
        console.log('Plantillas de ejemplo cargadas');
    }

    loadDefaultExample() {
        const defaultCode = `flowchart TD
    A[Inicio] --> B{Primera vez?}
    B -->|Si| C[Ver ejemplos]
    B -->|No| D[Crear diagrama]
    C --> E[Seleccionar plantilla]
    E --> F[Editar codigo]
    D --> F
    F --> G[Vista previa]
    G --> H{Satisfecho?}
    H -->|No| F
    H -->|Si| I[Descargar]
    I --> J[Completado]
    
    style A fill:#e1f5fe
    style J fill:#e8f5e8
    style B fill:#fff3e0
    style H fill:#fff3e0`;

        this.elements.mermaidCode.value = defaultCode;
        this.renderDiagram();
    }

    // Método para exportar diagrama como imagen de alta calidad
    async exportAsImage(format = 'png') {
        const svg = this.elements.mermaidOutput.querySelector('svg');
        if (!svg) {
            this.setStatus('No hay diagrama para exportar', 'warning');
            return;
        }

        try {
            this.setStatus('Generando imagen de alta calidad...', 'info');
            
            // Clonar el SVG para no afectar el original
            const svgClone = svg.cloneNode(true);
            
            // Obtener dimensiones del SVG
            const svgRect = svg.getBoundingClientRect();
            const originalWidth = svgRect.width || 800;
            const originalHeight = svgRect.height || 600;
            
            // Factor de escala para alta calidad
            const scaleFactor = 3;
            const width = originalWidth * scaleFactor;
            const height = originalHeight * scaleFactor;
            
            // Configurar el SVG clonado para alta resolución
            svgClone.setAttribute('width', width);
            svgClone.setAttribute('height', height);
            svgClone.style.width = width + 'px';
            svgClone.style.height = height + 'px';
            
            // Asegurar que el SVG tenga un fondo blanco
            const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            rect.setAttribute('width', '100%');
            rect.setAttribute('height', '100%');
            rect.setAttribute('fill', 'white');
            svgClone.insertBefore(rect, svgClone.firstChild);
            
            // Convertir SVG a string con encoding correcto
            const svgData = new XMLSerializer().serializeToString(svgClone);
            const encodedSvgData = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
            
            // Crear canvas y contexto
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // Configurar canvas para alta calidad
            canvas.width = width;
            canvas.height = height;
            
            // Mejorar la calidad del renderizado
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            
            // Fondo blanco
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, width, height);
            
            // Crear imagen desde SVG
            const img = new Image();
            
            img.onload = () => {
                try {
                    // Dibujar la imagen en el canvas
                    ctx.drawImage(img, 0, 0, width, height);
                    
                    // Convertir canvas a blob y descargar
                    canvas.toBlob((blob) => {
                        if (blob) {
                            const downloadUrl = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = downloadUrl;
                            a.download = `mermaid-diagram-hq.${format}`;
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);
                            URL.revokeObjectURL(downloadUrl);
                            
                            this.setStatus(`Imagen de alta calidad exportada (${width}x${height})`, 'success');
                        } else {
                            this.setStatus('Error al generar el archivo de imagen', 'error');
                        }
                    }, `image/${format}`, 1.0);
                    
                } catch (canvasError) {
                    console.error('Error with canvas:', canvasError);
                    // Fallback: descargar como SVG
                    this.downloadAsSVG(svgData);
                }
            };
            
            img.onerror = () => {
                console.error('Error loading SVG image');
                // Fallback: descargar como SVG
                this.downloadAsSVG(svgData);
            };
            
            // Cargar la imagen SVG
            img.src = encodedSvgData;
            
        } catch (error) {
            console.error('Error exporting high quality image:', error);
            this.setStatus('Error al exportar imagen', 'error');
        }
    }

    // Método fallback para descargar como SVG
    downloadAsSVG(svgData) {
        try {
            const blob = new Blob([svgData], { type: 'image/svg+xml' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'mermaid-diagram.svg';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            this.setStatus('Diagrama descargado como SVG (alta calidad)', 'success');
        } catch (error) {
            console.error('Error downloading SVG:', error);
            this.setStatus('Error al descargar imagen', 'error');
        }
    }

    // Método para compartir diagrama (funcionalidad adicional)
    shareCode() {
        const code = this.elements.mermaidCode.value;
        if (!code.trim()) {
            this.setStatus('No hay código para compartir', 'warning');
            return;
        }

        if (navigator.share) {
            navigator.share({
                title: 'Diagrama Mermaid',
                text: 'Mira este diagrama que creé:',
                url: window.location.href
            }).then(() => {
                this.setStatus('Diagrama compartido', 'success');
            }).catch(() => {
                this.copyToClipboard(code);
            });
        } else {
            this.copyToClipboard(code);
        }
    }

    copyToClipboard(text) {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text).then(() => {
                this.setStatus('Código copiado al portapapeles', 'success');
            }).catch(() => {
                this.fallbackCopyToClipboard(text);
            });
        } else {
            this.fallbackCopyToClipboard(text);
        }
    }

    fallbackCopyToClipboard(text) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
            document.execCommand('copy');
            this.setStatus('Código copiado al portapapeles', 'success');
        } catch (err) {
            this.setStatus('Error al copiar código', 'error');
        }
        
        document.body.removeChild(textArea);
    }
}

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.mermaidEditor = new MermaidEditor();
});

// Manejar errores globales
window.addEventListener('error', (event) => {
    console.error('Error global:', event.error);
    if (window.mermaidEditor) {
        window.mermaidEditor.setStatus('Error inesperado', 'error');
    }
});

// Prevenir pérdida de datos al cerrar la página
window.addEventListener('beforeunload', (event) => {
    const code = document.getElementById('mermaidCode')?.value;
    if (code && code.trim() && code !== window.mermaidEditor?.lastValidCode) {
        event.preventDefault();
        event.returnValue = '¿Estás seguro de que quieres salir? Los cambios no guardados se perderán.';
        return event.returnValue;
    }
});
