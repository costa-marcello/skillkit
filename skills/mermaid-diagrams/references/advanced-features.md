# Advanced Mermaid Features

Configuration, layout options, and integration patterns for creating professional diagrams.

<example name="Layout: Dagre Default">

## Layout Options

### Dagre Layout (Default)

```mermaid
---
config:
  layout: dagre
---
flowchart TD
    A --> B
```

</example>

<example name="Layout: ELK Advanced">

### ELK Layout (Advanced)

For complex diagrams with better automatic layout:

```mermaid
---
config:
  layout: elk
  elk:
    mergeEdges: true
    nodePlacementStrategy: BRANDES_KOEPF
---
flowchart TD
    A --> B
```

**ELK node placement strategies:**
- `SIMPLE` - Basic placement
- `NETWORK_SIMPLEX` - Network optimization
- `LINEAR_SEGMENTS` - Linear arrangement
- `BRANDES_KOEPF` - Balanced (default)

</example>

<example name="Look: Classic">

## Look Options

### Classic Look

Traditional Mermaid appearance:

```mermaid
---
config:
  look: classic
---
flowchart LR
    A --> B --> C
```

</example>

<example name="Look: Hand-Drawn">

### Hand-Drawn Look

Sketch-like, informal style:

```mermaid
---
config:
  look: handDrawn
---
flowchart LR
    A --> B --> C
```

</example>

<example name="Complete Configuration">

## Complete Configuration Example

```mermaid
---
config:
  theme: base
  look: handDrawn
  layout: dagre
  themeVariables:
    primaryColor: "#ff6b6b"
    primaryTextColor: "#fff"
    primaryBorderColor: "#d63031"
    lineColor: "#74b9ff"
    secondaryColor: "#00b894"
    tertiaryColor: "#fdcb6e"
---
flowchart TD
    Start([Begin Process]) --> Input[Gather Data]
    Input --> Process{Valid?}
    Process -->|Yes| Store[(Save to DB)]
    Process -->|No| Error[Show Error]
    Store --> Notify[Send Notification]
    Error --> Input
    Notify --> End([Complete])
```

</example>

<example name="Click Events">

## Click Events and Links

Add interactive elements:

```mermaid
flowchart LR
    A[GitHub]
    B[Documentation]
    C[Live Demo]

    click A "https://github.com" "Go to GitHub"
    click B "https://mermaid.js.org" "View Docs"
    click C "https://mermaid.live" "Try Live Editor"

    A --> B --> C
```

</example>

<example name="Tooltips">

## Tooltips

Add hover information:

```mermaid
flowchart LR
    A[Service A]
    B[Service B]

    A -.->|REST API| B

    %% Tooltips are defined with links
    link A: API Documentation @ https://api.example.com
    link B: Service Dashboard @ https://dashboard.example.com
```

</example>

<example name="Comments">

## Comments and Documentation

```mermaid
flowchart TD
    %% This is a single-line comment

    %% Multi-line comments can be created
    %% by using multiple comment lines

    A[Start]
    B[Process]
    C[End]

    %% Define relationships
    A --> B
    B --> C

    %% Add styling
    style A fill:#90EE90
    style C fill:#FFB6C1
```

</example>

<example name="Directional Hints">

## Directional Hints

Control layout direction for specific nodes:

```mermaid
flowchart TB
    A --> B
    B --> C
    B --> D
    C --> E
    D --> E

    %% This is a comment - helps organize complex diagrams
```

</example>

## Responsive Sizing

Use CSS to make diagrams responsive:

```html
<div style="max-width: 100%; overflow: auto;">
    <pre class="mermaid">
        flowchart LR
            A --> B --> C
    </pre>
</div>
```

## SVG Export Options

When exporting to SVG:

```bash
# Export with custom dimensions
mmdc -i diagram.mmd -o output.svg -w 1920 -H 1080

# Export with background color
mmdc -i diagram.mmd -o output.svg -b "#ffffff"

# Export with transparent background
mmdc -i diagram.mmd -o output.svg -b "transparent"
```

<example name="Performance: Large Diagrams">

## Performance Considerations

For large diagrams:

```mermaid
---
config:
  layout: elk
  elk:
    mergeEdges: true
---
flowchart TD
    %% ELK handles complex layouts better
    %% Merge edges reduces visual clutter
```

**Performance tips:**
- Use ELK layout for diagrams with >20 nodes
- Enable edge merging for simplified connections
- Split very large diagrams into multiple focused views
- Consider using subgraphs to organize complexity
- Limit styling to essential elements

</example>

<example name="Integration: Markdown">

## Integration Examples

### Markdown Files

````markdown
# System Architecture

```mermaid
flowchart LR
    A --> B
```
````

</example>

<example name="Integration: HTML">

### HTML Files

```html
<!DOCTYPE html>
<html>
<head>
    <script type="module">
        import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.esm.min.mjs';
        mermaid.initialize({
            startOnLoad: true,
            theme: 'dark',
            look: 'handDrawn'
        });
    </script>
</head>
<body>
    <pre class="mermaid">
        flowchart LR
            A --> B
    </pre>
</body>
</html>
```

</example>

<example name="Integration: React">

### React Components

```jsx
import React from 'react';
import mermaid from 'mermaid';

mermaid.initialize({
    startOnLoad: true,
    theme: 'forest'
});

function DiagramComponent() {
    React.useEffect(() => {
        mermaid.contentLoaded();
    }, []);

    return (
        <div className="mermaid">
            flowchart LR
                A --> B
        </div>
    );
}
```

</example>

## Best Practices for Advanced Features

1. **Use ELK for complex layouts** - When dagre creates crossed lines
2. **Comment complex configurations** - Explain non-obvious styling choices
3. **Test exports** - Verify diagrams render correctly in target format
4. **Use subgraphs** - Organize complexity into logical groups
5. **Keep configs versioned** - Track configuration changes in your repository
