# Comprehensive Research: Shear Force and Moment Calculator Requirements for Structural Engineers

## Executive Summary
This document provides comprehensive research on the requirements for a professional-grade shear force and moment calculator webapp. The research is based on structural engineering principles, industry practices, and the reference material from LibreTexts on Shear/Moment Diagrams.

---

## 1. Beam Types

### 1.1 Common Beam Configurations

Structural engineers regularly analyze the following beam types:

#### **Cantilever Beams**
- **Description**: Fixed at one end, free at the other
- **Support Conditions**: One fixed support
- **Common Applications**: Balconies, awnings, bridge decks, crane booms
- **Characteristics**:
  - Maximum moment occurs at fixed support
  - Zero shear and moment at free end
  - Often subjected to point loads or distributed loads

#### **Simply Supported Beams**
- **Description**: Supported at both ends, typically one pinned and one roller
- **Support Conditions**: One pinned support, one roller support
- **Common Applications**: Floor joists, bridge girders, roof beams
- **Characteristics**:
  - Zero moment at both supports
  - Maximum moment typically occurs at midspan or at load points
  - Most common beam type in structural analysis

#### **Fixed-Fixed Beams (Fixed-End Beams)**
- **Description**: Both ends are rigidly fixed
- **Support Conditions**: Two fixed supports
- **Common Applications**: Continuous frames, rigid portal frames
- **Characteristics**:
  - Develops negative moments at supports
  - More complex reaction calculations
  - Statically indeterminate (requires advanced analysis)

#### **Overhanging Beams**
- **Description**: Beam extends beyond one or both supports
- **Support Conditions**: Various (typically pinned and roller with cantilever extension)
- **Common Applications**: Building facades, extended roof structures
- **Characteristics**:
  - Negative moments in overhanging portions
  - Point of contraflexure (zero moment) within span

#### **Continuous Beams**
- **Description**: Beam continuous over three or more supports
- **Support Conditions**: Multiple supports (combination of pinned, roller, or fixed)
- **Common Applications**: Multi-span bridges, building floor systems
- **Characteristics**:
  - Statically indeterminate
  - Requires moment distribution or matrix methods
  - More efficient use of material than simple spans

#### **Propped Cantilever**
- **Description**: Cantilever beam with an additional support
- **Support Conditions**: One fixed support and one roller or pin
- **Common Applications**: Specialized structural applications
- **Characteristics**:
  - Statically indeterminate
  - Reduced deflections compared to simple cantilever

### 1.2 Priority for Initial Implementation
For a webapp calculator, implement in this order:
1. **Cantilever beams** (simplest, determinate)
2. **Simply supported beams** (most common)
3. **Overhanging beams** (extends simply supported)
4. **Fixed-fixed beams** (more complex, indeterminate)
5. **Continuous beams** (most complex, requires advanced methods)

---

## 2. Load Types

### 2.1 Primary Load Categories

#### **Point Loads (Concentrated Forces)**
- **Symbol**: P (in kN, kips, lb)
- **Parameters Required**:
  - Magnitude (F)
  - Position from reference point (x)
  - Direction (upward/downward)
- **Applications**: Column reactions, equipment loads, wheel loads
- **Effect on Diagrams**:
  - Creates "jump" in shear diagram
  - Creates change in slope of moment diagram
  - Shear diagram: vertical discontinuity of magnitude P
  - Moment diagram: linear slope changes at load point

#### **Uniformly Distributed Loads (UDL)**
- **Symbol**: w (in kN/m, lb/ft, kips/ft)
- **Parameters Required**:
  - Intensity (load per unit length)
  - Start position
  - End position
  - Direction (upward/downward)
- **Applications**: Self-weight, floor live loads, snow loads
- **Effect on Diagrams**:
  - Shear diagram: linear variation (slope = -w)
  - Moment diagram: parabolic (quadratic) curve
- **Formulas from PDF**:
  - dV/dx = -w(x)
  - ΔV = ∫w(x)dx
  - d²M/dx² = -w(x)

#### **Triangular Distributed Loads**
- **Description**: Linearly varying load from zero to maximum
- **Parameters Required**:
  - Maximum intensity (w_max)
  - Start position
  - End position
  - Direction of variation (increasing/decreasing)
- **Applications**: Hydrostatic pressure on retaining walls, soil pressure
- **Effect on Diagrams**:
  - Shear diagram: parabolic curve
  - Moment diagram: cubic curve

#### **Trapezoidal Distributed Loads**
- **Description**: Linearly varying load between two non-zero values
- **Parameters Required**:
  - Starting intensity (w₁)
  - Ending intensity (w₂)
  - Start position
  - End position
- **Applications**: Combined loading conditions, partial soil pressure
- **Effect on Diagrams**:
  - Shear diagram: parabolic variation
  - Moment diagram: cubic variation

#### **Applied Moments (Couples)**
- **Symbol**: M (in kN·m, ft-lb, kip-ft)
- **Parameters Required**:
  - Magnitude
  - Position
  - Direction (clockwise/counterclockwise)
- **Applications**: Applied torques, end moments from connected members
- **Effect on Diagrams**:
  - Shear diagram: no effect
  - Moment diagram: vertical "jump" discontinuity
  - From PDF: "Jump upwards by magnitude for negative (clockwise) moments, downwards for positive (counter-clockwise) moments"

### 2.2 Load Combinations

Engineers need to analyze **multiple loads simultaneously**:
- Multiple point loads at different positions
- Combination of point loads and distributed loads
- Distributed loads over different segments
- Point loads + distributed loads + applied moments

### 2.3 Load Direction Convention
- **Downward loads**: Negative (most common - gravity loads)
- **Upward loads**: Positive (reactions, uplift)
- Sign convention must be clearly indicated in the webapp

---

## 3. Support Types

### 3.1 Support Definitions and Reactions

#### **Fixed Support (Rigid/Clamped Support)**
- **Symbol**: Typically shown as hatched triangle/wall
- **Restraints**:
  - No translation in x-direction (horizontal)
  - No translation in y-direction (vertical)
  - No rotation
- **Reactions Provided**:
  - Horizontal reaction force (Rₓ or Hₐ)
  - Vertical reaction force (Rᵧ or Vₐ)
  - Reaction moment (M)
- **Degrees of Freedom Restrained**: 3
- **Applications**: Wall connections, foundation connections, rigid frames
- **Example from PDF**: Cantilever beam fixed at support B

#### **Pinned Support (Hinged Support)**
- **Symbol**: Triangle with pin/circle
- **Restraints**:
  - No translation in x-direction
  - No translation in y-direction
  - Allows rotation (free to rotate)
- **Reactions Provided**:
  - Horizontal reaction force (Rₓ)
  - Vertical reaction force (Rᵧ)
  - No moment reaction
- **Degrees of Freedom Restrained**: 2
- **Applications**: Beam-column connections, truss joints
- **Typical Use**: One end of simply supported beams

#### **Roller Support**
- **Symbol**: Triangle with rollers/wheels underneath
- **Restraints**:
  - No translation in y-direction (vertical)
  - Allows translation in x-direction (horizontal)
  - Allows rotation
- **Reactions Provided**:
  - Vertical reaction force (Rᵧ) only
  - No horizontal reaction
  - No moment reaction
- **Degrees of Freedom Restrained**: 1
- **Applications**: Expansion joints, thermal movement accommodation
- **Typical Use**: One end of simply supported beams (allows thermal expansion)

### 3.2 Support Positioning
- **Location Parameters**: Distance from reference origin (x-coordinate)
- **Multiple Supports**: Continuous beams require 3+ support locations
- **Reference System**: Typically measured from left end (x = 0)

### 3.3 Sign Convention from PDF
The webapp must follow standard sign conventions:
- Positive shear: Causes clockwise rotation of element
- Negative shear: Causes counterclockwise rotation of element
- Positive moment: Causes beam to "smile" (concave upward)
- Negative moment: Causes beam to "frown" (concave downward)

---

## 4. Parameters Engineers Need to Modify

### 4.1 Geometric Parameters

#### **Beam Length**
- **Input Type**: Numerical value
- **Units**: meters (m), feet (ft), inches (in)
- **Typical Range**: 0.5m to 50m (residential to bridge spans)
- **Validation**: Must be positive, non-zero
- **UI Consideration**: Visual representation should scale appropriately

#### **Support Locations**
- **Input Type**: Distance from origin
- **Constraints**: Must be ≥ 0 and ≤ beam length
- **Multiple Supports**: Array of positions for continuous beams
- **UI Consideration**: Drag-and-drop interface or numerical input

### 4.2 Load Parameters

#### **Load Magnitudes**
- **Point Loads**: Force value (P)
- **Distributed Loads**: Intensity (w) in force/length
- **Moments**: Moment value (M) in force·length
- **Sign**: Positive (upward) or negative (downward)

#### **Load Positions**
- **Point Loads**: Single x-coordinate
- **Distributed Loads**: Start and end x-coordinates
- **Moments**: Single x-coordinate of application

#### **Load Direction**
- **Visual Indicators**: Arrows showing direction
- **Numerical**: Sign convention (+ or -)

### 4.3 Material Properties (Advanced Features)

#### **For Stress Calculations**
- **Elastic Modulus (E)**: Young's modulus (Pa, psi)
  - Steel: ~200 GPa (29,000 ksi)
  - Concrete: ~25-40 GPa (3,600-5,800 ksi)
  - Wood: ~10-15 GPa (1,500-2,200 ksi)
  - Aluminum: ~70 GPa (10,000 ksi)

#### **For Deflection Calculations**
- **Second Moment of Area (I)**: m⁴, in⁴
- **Section Modulus (S)**: m³, in³

### 4.4 Cross-Section Properties

#### **Standard Shapes**
- Rectangular: width (b) × depth (h)
- I-beam: Standard designations (W-shapes, S-shapes)
- Circular: diameter (d)
- Hollow sections: outer and inner dimensions
- Custom: User-defined I and S values

#### **Section Properties Database**
- Standard steel sections (AISC database)
- Standard timber sections
- Concrete sections (user-defined)

### 4.5 Unit System

#### **Force Units**
- SI: Newton (N), kilonewton (kN), meganewton (MN)
- Imperial: pound (lb), kip (1000 lb), ton

#### **Length Units**
- SI: millimeter (mm), meter (m)
- Imperial: inch (in), foot (ft)

#### **Moment Units**
- SI: N·m, kN·m
- Imperial: lb-ft, kip-ft, lb-in

#### **Distributed Load Units**
- SI: N/m, kN/m
- Imperial: lb/ft, kip/ft, plf (pounds per linear foot)

#### **Unit Conversion**
- Automatic conversion between systems
- Display in user's preferred units
- Consistent unit system throughout calculation

### 4.6 Analysis Options

#### **Number of Points for Plotting**
- Resolution of diagrams (default: 100-500 points)
- Affects smoothness of curves

#### **Precision**
- Decimal places for results
- Engineering vs. scientific notation

---

## 5. Output Requirements

### 5.1 Graphical Outputs

#### **Shear Force Diagram (SFD)**
- **X-axis**: Position along beam (length units)
- **Y-axis**: Shear force (force units)
- **Convention from PDF**:
  - Positive shear: typically drawn above axis
  - Negative shear: typically drawn below axis
  - Must be clearly labeled with (+) or (-)
- **Visual Requirements**:
  - Clear axis labels with units
  - Grid lines for reading values
  - Zero reference line
  - Distinct colors for positive/negative regions
  - Smooth curves for distributed loads
  - Sharp transitions at point loads

#### **Bending Moment Diagram (BMD)**
- **X-axis**: Position along beam (length units)
- **Y-axis**: Bending moment (force·length units)
- **Convention from PDF**:
  - Positive moments: drawn above neutral axis (beam "smiles")
  - Negative moments: drawn below neutral axis (beam "frown")
- **Visual Requirements**:
  - Clear axis labels with units
  - Grid lines for reading values
  - Zero reference line
  - Parabolic curves for UDL regions
  - Linear slopes for point load regions
  - Inflection points marked

#### **Beam Loading Diagram**
- **Shows**:
  - Beam orientation (horizontal)
  - All applied loads (point, distributed, moments)
  - Support symbols (fixed, pinned, roller)
  - Dimensions and positions
  - Load magnitudes and directions
- **Must align** with SFD and BMD for easy correlation

#### **Deflection Curve (Advanced)**
- **Shows**: Deformed shape of beam
- **Exaggerated scale**: For visibility
- **Y-axis**: Deflection (length units)
- **Helps visualize**: Beam behavior under loading

### 5.2 Numerical Outputs

#### **Reaction Forces at Supports**
From PDF example (Example 2):
- B_x = 0 (horizontal reaction)
- B_y = 100 kN (vertical reaction)
- M = 250 kN·m (moment reaction)

**Output Format**:
```
Support A (Pinned):
  - Horizontal Reaction: 25.0 kN →
  - Vertical Reaction: 39.0 kN ↑

Support B (Roller):
  - Vertical Reaction: 26.0 kN ↑
```

#### **Maximum Values and Locations**

**Maximum Shear Force**:
- Value (magnitude and sign)
- Location (x-coordinate)
- Multiple maxima if applicable

**Maximum Bending Moment**:
- Value (magnitude and sign)
- Location (x-coordinate)
- From PDF: "When V = 0, that's max or min M"

**Minimum Values**:
- Same format as maximum values

Example Output:
```
Maximum Positive Moment: 39.0 kN·m at x = 3.25 m
Maximum Negative Moment: -36.0 kN·m at x = 6.0 m
Maximum Shear: 26.0 kN at x = 0 m
```

#### **Tables of Values at Critical Points**

Critical points include:
- Support locations
- Load application points
- Start/end of distributed loads
- Points of zero shear (max/min moment)
- Maximum/minimum value locations

**Table Format**:
```
Position (m) | Shear (kN) | Moment (kN·m)
-------------|------------|---------------
0.00         | 25.0       | 0.0
3.00         | 13.0       | 39.0
6.00         | -37.0      | -36.0
8.00         | 10.0       | 0.0
```

#### **Deflection Values (Advanced)**

**Maximum Deflection**:
- Value (mm, in)
- Location
- Allowable vs. actual comparison

**Deflection at Specific Points**:
- User-specified locations
- Midspan deflection (common requirement)

### 5.3 Stress Analysis Output (Advanced)

#### **Maximum Bending Stress**
- **Formula**: σ = M·c/I or σ = M/S
- **Location**: Top and bottom fibers
- **Output**: Tension and compression stresses

#### **Maximum Shear Stress**
- **Formula**: τ = VQ/(Ib)
- **Location**: Neutral axis typically
- **Output**: Maximum shear stress value

#### **Stress Diagrams**
- Stress distribution along beam length
- Combined stress state

### 5.4 Export Capabilities

#### **Report Generation**
- PDF report with all diagrams and results
- Professional formatting
- Company/project header option
- Calculation summary

#### **Data Export**
- CSV format for spreadsheet analysis
- Coordinates of diagrams for external plotting
- Raw numerical data

#### **Image Export**
- PNG/SVG of individual diagrams
- High resolution for reports
- Transparent backgrounds option

---

## 6. Common Use Cases

### 6.1 Educational Applications

#### **Student Learning**
- **Purpose**: Understand beam behavior and diagram construction
- **Features Needed**:
  - Step-by-step calculation display
  - Visual feedback on load effects
  - Comparison with hand calculations
  - Simple examples with known solutions
- **From PDF**: Examples 1-6 show progressive complexity

#### **Homework Verification**
- **Purpose**: Check student solutions
- **Features Needed**:
  - Exact values at specific points
  - Show calculation method
  - Explain sign conventions

### 6.2 Professional Design Applications

#### **Preliminary Design**
- **Purpose**: Quick sizing and feasibility checks
- **Beam Types**: Simply supported, cantilever
- **Typical Scenario**: "What size beam do I need for a 6m span with 5 kN/m load?"
- **Speed Critical**: Fast input and results

#### **Design Verification**
- **Purpose**: Verify calculations from other software or hand calcs
- **Need**: High accuracy and detailed results
- **Comparison**: Against code requirements and allowable stresses

#### **Code Compliance Checks**
- **Purpose**: Ensure design meets building codes
- **Requirements**:
  - Stress limits (AISC, ACI, NDS, Eurocode)
  - Deflection limits (L/360, L/240, etc.)
  - Load combinations (Dead + Live, Wind, Seismic)

### 6.3 Analysis Scenarios

#### **Residential Floor Joist Analysis**
- **Beam Type**: Simply supported
- **Loads**:
  - Dead load: 1.5-2.5 kN/m² (self-weight, finishes)
  - Live load: 1.9-4.8 kN/m² (occupancy)
- **Span**: 2-6 m typical
- **Check**: Deflection often governs (L/360 limit)

#### **Cantilever Balcony/Awning**
- **Beam Type**: Cantilever
- **Loads**:
  - Dead load: Self-weight
  - Live load: 4.8 kN/m² (assembly)
  - Point load: Rail post reactions
- **Critical**: Maximum moment at fixed support

#### **Bridge Girder Analysis**
- **Beam Type**: Simply supported or continuous
- **Loads**:
  - Dead load: Deck weight
  - Live load: Vehicle loads (HS-20, HL-93)
  - Moving loads (advanced)
- **Long spans**: 10-50+ m

#### **Industrial Platform Beams**
- **Beam Type**: Various
- **Loads**:
  - Heavy equipment (point loads)
  - Storage (heavy distributed loads)
  - Impact factors
- **High stress**: Strength typically governs

### 6.4 Comparison and Optimization

#### **Section Comparison**
- **Purpose**: Compare different beam sizes
- **Process**:
  1. Analyze with W12×26
  2. Analyze with W12×30
  3. Compare stresses and deflections
  4. Select most economical adequate section

#### **Load Path Analysis**
- **Purpose**: Understand how loads transfer through structure
- **Multiple beams**: How one beam loads another

### 6.5 Troubleshooting and Investigation

#### **Failure Investigation**
- **Purpose**: Understand why beam failed or cracked
- **Analyze**: Actual vs. design loads
- **Identify**: Critical stress locations

#### **Renovation/Retrofit**
- **Purpose**: Check if existing beam can handle new loads
- **Scenario**: Adding equipment to existing floor
- **Compare**: Original capacity vs. new demands

---

## 7. User Experience Needs

### 7.1 Intuitive Input Methods

#### **Visual/Interactive Input**
- **Drag-and-Drop Interface**:
  - Place supports by dragging onto beam
  - Position loads by dragging
  - Adjust load magnitude with sliders or direct manipulation
- **Click-to-Add**:
  - Click beam to add point load at location
  - Click and drag to define distributed load region
  - Right-click for load properties

#### **Numerical Input**
- **Forms with Clear Labels**:
  - "Point Load: Magnitude (kN) ___ Position (m) ___"
  - Input validation (real-time feedback on errors)
- **Unit Selection**: Dropdown menus adjacent to inputs

#### **Template/Preset Loading**
- **Common Scenarios**:
  - "Simply supported beam with central point load"
  - "Cantilever with UDL"
  - "Beam with multiple point loads"
- **Quick Start**: Load template and modify

### 7.2 Real-Time Visual Feedback

#### **Live Diagram Updates**
- **As you type**: Diagrams update in real-time
- **Preview mode**: See effect before committing
- **Smooth animations**: Help understand cause-effect relationship

#### **Interactive Diagrams**
- **Hover for values**: Mouse over diagram shows V and M at that point
- **Click for details**: Click point to see exact values
- **Zoom and pan**: For detailed inspection

### 7.3 Clear Organization and Layout

#### **Logical Workflow**
1. **Define beam geometry** (length, supports)
2. **Add loads** (point, distributed, moments)
3. **Set properties** (material, section - optional)
4. **Calculate** (automatic or button-triggered)
5. **Review results** (diagrams, tables, values)

#### **Panel Organization**
- **Left panel**: Input controls
- **Center panel**: Visual beam representation and diagrams
- **Right panel**: Numerical results and tables
- **Collapsible sections**: Hide advanced options when not needed

### 7.4 Helpful Features

#### **Tooltips and Help**
- **Hover tooltips**: Explain each input parameter
- **Question mark icons**: Link to detailed help
- **Sign convention reference**: Always visible or easily accessible
- **Formula reference**: Show formulas being used

#### **Error Prevention**
- **Input validation**:
  - Prevent negative beam length
  - Warn if load position > beam length
  - Check for conflicting supports
- **Warning messages**:
  - "Support locations must be within beam length"
  - "Roller support cannot resist horizontal loads"

#### **Undo/Redo**
- **Full history**: Undo any change
- **Keyboard shortcuts**: Ctrl+Z, Ctrl+Y

### 7.5 Efficiency Features

#### **Keyboard Shortcuts**
- **Add load**: Ctrl+L
- **Add support**: Ctrl+S
- **Calculate**: Ctrl+Enter
- **Export**: Ctrl+E

#### **Copy/Duplicate**
- **Duplicate loads**: Copy load and adjust position
- **Mirror loads**: Flip loading about centerline
- **Save configurations**: Save and load beam setups

#### **Batch Analysis**
- **Parameter sweep**: Vary one parameter, see effect
- **Multiple cases**: Analyze several load combinations

### 7.6 Professional Appearance

#### **Clean, Modern Interface**
- **Minimal clutter**: Show only necessary information
- **Professional color scheme**: Engineering blue/gray tones
- **High contrast**: Readable in various lighting

#### **Print-Ready Output**
- **Professional diagrams**: Suitable for reports
- **Clear labels**: All axes and values labeled
- **Company branding**: Option to add logo/company info

### 7.7 Mobile/Responsive Design

#### **Tablet Compatibility**
- **Touch-friendly controls**: Larger buttons and targets
- **Gesture support**: Pinch to zoom, swipe to pan

#### **Responsive Layout**
- **Stacked on mobile**: Panels stack vertically
- **Horizontal on desktop**: Side-by-side panels

### 7.8 Accessibility

#### **Screen Reader Support**
- **ARIA labels**: For all interactive elements
- **Keyboard navigation**: Full functionality without mouse

#### **Color Blindness**
- **Not relying solely on color**: Use patterns or labels
- **High contrast mode**: Option for better visibility

---

## 8. Validation Requirements

### 8.1 Self-Validation Methods

#### **Equilibrium Check (Critical)**
From the PDF: "By the time you get to the left end of the plot, you should always wind up coming back to zero. If you don't wind up back at zero, go back and check your previous work."

**Force Equilibrium**:
- ΣF_y = 0 (sum of vertical forces = 0)
- Sum of reactions should equal sum of applied loads
- **Display to user**: "Equilibrium check: ΣF_y = 0.00 kN ✓"

**Moment Equilibrium**:
- ΣM = 0 (about any point)
- **Display to user**: "Equilibrium check: ΣM@A = 0.00 kN·m ✓"

**Diagram Closure**:
- Shear diagram: Must return to zero at free end or close to zero at supports
- Moment diagram: Must be zero at simple supports
- **Visual indicator**: If not closed, highlight error

#### **Relationship Verification**
From PDF formulas:
- **dM/dx = V**: Slope of moment diagram equals shear value
- **dV/dx = -w**: Slope of shear diagram equals negative load intensity
- **Numerical check**: Compare analytical derivative with finite difference

#### **Area Under Curve**
From PDF equations:
- ΔM = ∫V(x)dx: "Change in moment equals area under shear diagram"
- ΔV = ∫w(x)dx: "Change in shear equals area under load diagram"
- **Validation**: Calculate areas numerically and compare with calculated values

### 8.2 Comparison with Known Solutions

#### **Standard Case Library**
- **Built-in examples**: From PDF and textbooks
- **Example 1**: Cantilever with point load at free end
  - V = -5lb (constant)
  - M = -5x (linear, M_max = -15 ft-lb at support)
- **Example 2**: Cantilever with UDL
  - V = -20x (linear, V_max = -100 kN)
  - M = -10x² (parabolic, M_max = -250 kN·m)

#### **Formula Book Solutions**
- **Roark's Formulas**: Standard reference
- **AISC Design Guide**: Beam formulas
- **Comparison feature**: "Compare with standard case #X"

### 8.3 Hand Calculation Verification

#### **Show Detailed Calculations**
- **Reaction calculations**:
  ```
  ΣM_A = 0: -5lb(3ft) + B_y(0) - M_B = 0
  M_B = -15 ft-lb

  ΣF_y = 0: -5lb + B_y = 0
  B_y = 5 lb
  ```
- **Step-by-step shear/moment**:
  - Section at x = 1.5 ft:
    - V = -5 lb (from equilibrium of left section)
    - M = -5(1.5) = -7.5 ft-lb

#### **Export Calculations**
- **PDF report**: With all calculation steps
- **For checking**: Engineers can verify each step
- **For documentation**: Permanent record

### 8.4 Cross-Validation with Other Software

#### **Comparison Features**
- **Import from**: Other formats (if possible)
- **Export to**: Standard formats for checking in FEA software
- **Common software**:
  - RISA
  - SAP2000
  - STAAD.Pro
  - Robot Structural Analysis

#### **Benchmark Problems**
- **Industry standard problems**: Known solutions
- **Automated testing**: Run benchmarks automatically
- **Display accuracy**: % difference from known solution

### 8.5 Engineering Judgment Checks

#### **Reasonableness Checks**
- **Deflection**: Excessive deflection warning (L/100 might indicate error)
- **Stress**: Yield stress exceeded warning
- **Load direction**: "Load is upward - is this correct?"

#### **Common Mistake Prevention**
- **Units**: "Mixing units? Moment units don't match force × length"
- **Support type**: "Roller cannot resist horizontal load - add pin support"
- **Statically determinate**: "This beam is unstable - insufficient supports"

### 8.6 Automated Validation Features

#### **Real-Time Validation**
- **As you input**: Continuous validation
- **Error highlighting**: Red border on invalid inputs
- **Warning messages**: Clear explanation of problem

#### **Validation Report**
When user clicks "Validate" or "Check":
```
✓ Equilibrium satisfied: ΣF_y = 0.00 kN
✓ Moment equilibrium: ΣM = 0.00 kN·m
✓ Shear diagram closure verified
✓ Moment diagram closure verified
✓ Boundary conditions satisfied
✓ dM/dx = V relationship verified
✓ No unstable configurations detected
```

#### **Warning System**
- **Critical errors**: Prevent calculation (red)
- **Warnings**: Allow calculation but flag issues (yellow)
- **Information**: Helpful hints (blue)

### 8.7 Physical Behavior Verification

#### **Sign Convention Consistency**
From PDF:
- **Positive moment**: Beam bends "smile" shape (concave up)
- **Negative moment**: Beam bends "frown" shape (concave down)
- **Visual check**: Does deflected shape match moment diagram?

#### **Expected Behavior**
- **Simply supported beam with downward load**:
  - Should have positive moment (sagging)
  - Should deflect downward
- **Cantilever with downward load**:
  - Should have negative moment at support
  - Free end deflects downward

#### **Maximum Value Locations**
From PDF: "When V = 0, that's max or min M"
- **Validation**: Check that M_max occurs where V = 0
- **For UDL**: Maximum moment at midspan of simply supported
- **For point load**: Maximum moment at load point

---

## 9. Formulas and Calculation Methods (from PDF)

### 9.1 Fundamental Relationships

#### **Load-Shear-Moment Relationships**

From PDF Equations 6.1 - 6.5:

**First Order Relationships**:
```
dM/dx = V(x)          [Equation 6.1]
dV/dx = -w(x)         [Equation 6.3]
```

**Second Order Relationship**:
```
d²M/dx² = -w(x)       [Equation 6.5]
```

**Integral Forms**:
```
ΔM = ∫V(x)dx          [Equation 6.2]
ΔV = ∫w(x)dx          [Equation 6.4]
```

#### **Physical Interpretation**
From PDF:
- "The slope of the moment diagram at a particular point is equal to the shear force at that same point"
- "The change in moment equals the area under the shear diagram"
- "The change in shear force is equal to the area under the load diagram"

### 9.2 Calculation Methods

#### **Method 1: Integration Method**
- Find load function w(x)
- Integrate to find V(x)
- Integrate V(x) to find M(x)
- Apply boundary conditions

#### **Method 2: Equilibrium Method (from PDF Section 6.2.3)**

**Step-by-Step Process**:
1. Draw FBD of structure
2. Calculate reactions using equilibrium equations
3. Make cuts at critical sections
4. Apply internal forces (N, V, M) using positive sign convention
5. For each section, find V(x) expression
6. For each section, find M(x) expression
7. Plot equations

**Example from PDF (Cantilever, Example 1)**:
```
Given: 5 lb point load at free end, 3 ft from wall

Reactions:
  ΣF_x = 0: B_x = 0
  ΣF_y = 0: -5lb + B_y = 0  →  B_y = 5lb
  ΣM_B = 0: (5lb)(3ft) - M = 0  →  M = 15 ft-lb

Shear (0 < x < 3 ft):
  ΣF_y = -5lb - V = 0
  V = -5lb (constant)

Moment (0 < x < 3 ft):
  ΣM_L = -Vx - M = 0  (summing about left end)
  M = -(5lb)x  (linear)

At x=0: M = 0
At x=3ft: M = -15 ft-lb
```

#### **Method 3: Area Method**
- Calculate reactions
- Plot shear by tracking area under load diagram
- Plot moment by tracking area under shear diagram

### 9.3 Sign Conventions

#### **Positive Sign Convention (from PDF)**

**Shear Force**:
- Positive shear: Upward force on left side of cut, downward on right
- "Causes clockwise rotation of element"

**Bending Moment**:
- Positive moment: "Beam bends to smile shape" (tension on bottom)
- Negative moment: "Beam bends to frown shape" (tension on top)

**Visual from PDF**:
- Shows internal forces N, V, M on beam element
- Positive directions clearly indicated

### 9.4 Diagram Shape Rules (from PDF Section 6.2.4)

#### **General Rules**:
- "+V means increasing M"
- "-V means decreasing M"
- "When V = 0, that's max or min M"

#### **Shape Based on Loading**:

**No distributed load (w = 0)**:
- Shear: Constant (horizontal line)
- Moment: Linear (straight sloped line)

**Constant distributed load (w = constant)**:
- Shear: Linear slope (slope = -w)
- Moment: Parabolic (quadratic curve)

**Linearly varying load (triangular)**:
- Shear: Parabolic
- Moment: Cubic curve

#### **Discontinuities**:

**Point Load P**:
- Shear: Vertical jump of magnitude P
- Moment: Change in slope (kink)

**Applied Moment M**:
- Shear: No change
- Moment: Vertical jump of magnitude M

### 9.5 Boundary Conditions

#### **Cantilever Beams**:
- Free end: V = 0, M = 0
- Fixed end: V = reaction, M = reaction moment

#### **Simply Supported Beams**:
- At both supports: M = 0
- At supports: V = ± reaction force

#### **Continuous Beams**:
- At simple supports: M = 0
- At interior supports: V has discontinuity = reaction

---

## 10. Implementation Priorities

### 10.1 Phase 1: Core Functionality (MVP - Minimum Viable Product)

**Beam Types**:
- Cantilever
- Simply supported

**Load Types**:
- Point loads
- Uniformly distributed loads

**Support Types**:
- Fixed
- Pinned
- Roller

**Outputs**:
- Shear force diagram
- Bending moment diagram
- Reaction calculations
- Maximum V and M values

**Input Method**:
- Numerical form inputs
- Basic visual representation

**Validation**:
- Equilibrium checks
- Boundary condition verification

### 10.2 Phase 2: Enhanced Functionality

**Additional Beam Types**:
- Overhanging beams

**Additional Load Types**:
- Applied moments
- Multiple simultaneous loads

**Enhanced Outputs**:
- Tables of values at critical points
- Interactive diagrams (hover for values)
- Export to PDF

**UI Improvements**:
- Drag-and-drop load placement
- Real-time diagram updates
- Templates for common cases

### 10.3 Phase 3: Advanced Features

**Beam Types**:
- Fixed-fixed beams
- Continuous beams (3+ supports)

**Load Types**:
- Triangular distributed loads
- Trapezoidal distributed loads
- Variable distributed loads

**Advanced Analysis**:
- Deflection calculations
- Stress calculations
- Section property database
- Material property library

**Professional Features**:
- Unit conversion
- Multiple load combinations
- Code compliance checks
- Comprehensive reports

### 10.4 Future Enhancements

**Advanced Capabilities**:
- Moving loads
- Dynamic loads
- Influence lines
- 3D visualization
- Multi-span continuous beams
- Non-prismatic beams
- Temperature effects
- Settlement effects

**Integration**:
- API for external applications
- Cloud storage for projects
- Collaboration features
- Mobile app

---

## 11. Technical Requirements

### 11.1 Calculation Engine

**Numerical Methods**:
- Integration: Numerical integration for distributed loads
- Root finding: Locate zero shear points (max moment)
- Interpolation: Smooth diagram plotting

**Accuracy**:
- Double precision floating point
- Error tolerance: < 0.01% for standard cases
- Validation against known solutions

**Performance**:
- Real-time calculation (< 100ms for simple beams)
- Efficient for complex loading (< 1s for continuous beams)

### 11.2 Plotting Requirements

**Resolution**:
- Minimum 100 points per diagram
- Adaptive refinement at discontinuities
- High-res export (300 DPI)

**Interactive Features**:
- Zoom: Mouse wheel or pinch gesture
- Pan: Click and drag
- Hover: Display values
- Click: Show detailed info

### 11.3 Data Management

**Save/Load**:
- Local storage for quick access
- Cloud storage for multi-device access
- Project management (multiple beams)

**File Formats**:
- Native JSON format
- Import/export CSV for data
- Export PDF for reports
- Export images (PNG, SVG)

### 11.4 Browser Compatibility

**Supported Browsers**:
- Chrome (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Edge (latest 2 versions)

**Technologies**:
- HTML5 Canvas or SVG for graphics
- JavaScript for calculations
- Responsive CSS for layout
- WebGL for advanced 3D (future)

---

## 12. References and Standards

### 12.1 Primary Reference
- LibreTexts Engineering: "6.2: Shear/Moment Diagrams"
  - Sign conventions
  - Calculation methods
  - Examples and validation

### 12.2 Structural Engineering References

**Textbooks**:
- "Mechanics of Materials" - Beer, Johnston, DeWolf
- "Structural Analysis" - Hibbeler
- "Roark's Formulas for Stress and Strain"

**Design Codes**:
- AISC Steel Construction Manual (USA)
- ACI 318 Concrete Building Code (USA)
- NDS National Design Specification for Wood (USA)
- Eurocode 3 (Steel - Europe)
- AS 4100 (Steel - Australia)

### 12.3 Online Calculators (for benchmarking)

From PDF Section 6.2.4:
- SkyCiv Free Beam Calculator: https://skyciv.com/free-beam-calculator/
- ClearCalcs Beam Analysis: https://clearcalcs.com/freetools/beam-analysis/au
- BeamGuru: https://beamguru.com/beam/

**Note**: These are for learning and comparison, not to be replicated exactly.

---

## 13. Conclusion and Recommendations

### 13.1 Key Findings

**Essential Features for Engineers**:
1. **Accuracy**: Must match hand calculations exactly
2. **Speed**: Real-time results for quick design iterations
3. **Visual clarity**: Clear, unambiguous diagrams
4. **Validation**: Built-in checks to catch errors
5. **Flexibility**: Handle various beam types and loading
6. **Professional output**: Suitable for documentation

### 13.2 Critical Success Factors

**For Educational Use**:
- Show calculation steps
- Clear sign conventions
- Simple examples to start
- Validation against known solutions

**For Professional Use**:
- Fast, efficient input
- Accurate, reliable results
- Professional quality output
- Export capabilities
- Unit flexibility

### 13.3 Differentiation Opportunities

**What can make this webapp stand out**:
1. **Superior UX**: Best-in-class interface with drag-and-drop
2. **Education focus**: Step-by-step explanations and learning mode
3. **Mobile-friendly**: Work on tablet at job site
4. **Free access**: Basic features free, advanced features paid
5. **Community features**: Share examples, templates
6. **Integration**: API for other applications

### 13.4 Development Approach

**Recommended Strategy**:
1. Start with Phase 1 (MVP) - cantilever and simply supported beams
2. Validate thoroughly with hand calculations and reference examples
3. Get feedback from engineers and students
4. Iterate based on feedback
5. Add Phase 2 and 3 features based on user demand

**Quality Focus**:
- Accuracy over features initially
- Validation is not optional
- User testing at each phase
- Documentation from the start

---

## Appendix A: Example Validation Cases

### A.1 Cantilever with Point Load (from PDF Example 1)
**Given**:
- Length: 3 ft
- Point load: 5 lb at free end (x=0)
- Fixed support at x=3 ft

**Expected Results**:
- Reactions: B_y = 5 lb, M_B = 15 ft-lb
- Shear: V = -5 lb (constant)
- Moment: M = -5x (linear)
  - At x=0: M = 0
  - At x=3 ft: M = -15 ft-lb

### A.2 Cantilever with UDL (from PDF Example 2)
**Given**:
- Length: 5 m
- UDL: 20 kN/m over entire length
- Fixed support at x=5 m

**Expected Results**:
- Reactions: B_y = 100 kN, M_B = 250 kN·m
- Shear: V = -20x
  - At x=0: V = 0
  - At x=5 m: V = -100 kN
- Moment: M = -10x²
  - At x=0: M = 0
  - At x=2.5 m: M = -62.5 kN·m
  - At x=5 m: M = -250 kN·m

### A.3 Simply Supported with Central Point Load
**Given**:
- Length: 10 m
- Point load: 20 kN at center (x=5 m)
- Pin support at x=0, Roller at x=10 m

**Expected Results**:
- Reactions: A_y = 10 kN, B_y = 10 kN
- Shear:
  - 0 < x < 5: V = 10 kN
  - 5 < x < 10: V = -10 kN
- Moment:
  - 0 < x < 5: M = 10x
  - 5 < x < 10: M = 10(10-x)
  - M_max = 50 kN·m at x = 5 m

---

## Appendix B: Sign Convention Reference Card

### From PDF Documentation

**Shear Force**:
- **Positive (+)**: Upward on left face, downward on right face
- **Negative (-)**: Downward on left face, upward on right face

**Bending Moment**:
- **Positive (+)**: Compression on top, tension on bottom (smile ⌣)
- **Negative (-)**: Tension on top, compression on bottom (frown ⌢)

**Applied Loads**:
- **Downward**: Negative (gravity loads)
- **Upward**: Positive (reactions, uplift)

**Applied Moments**:
- **Clockwise**: Negative
- **Counter-clockwise**: Positive

**Distributed Loads**:
- **Downward**: Negative intensity
- **Upward**: Positive intensity

---

## Appendix C: Quick Reference Formulas

### Fundamental Equations (from PDF)

```
dM/dx = V(x)                    [Rate of change of moment = Shear]

dV/dx = -w(x)                   [Rate of change of shear = -Load intensity]

d²M/dx² = -w(x)                 [Second derivative of moment = -Load intensity]

ΔM = ∫V(x)dx                    [Change in moment = Area under shear diagram]

ΔV = ∫w(x)dx                    [Change in shear = Area under load diagram]
```

### Common Beam Formulas

**Simply Supported, Central Point Load P, Length L**:
- Reactions: R_A = R_B = P/2
- M_max = PL/4 (at center)
- V_max = P/2

**Simply Supported, UDL w over Length L**:
- Reactions: R_A = R_B = wL/2
- M_max = wL²/8 (at center)
- V_max = wL/2

**Cantilever, Point Load P at Free End, Length L**:
- Fixed end reaction: R = P
- Fixed end moment: M = PL
- M_max = PL (at fixed end)

**Cantilever, UDL w over Length L**:
- Fixed end reaction: R = wL
- Fixed end moment: M = wL²/2
- M_max = wL²/2 (at fixed end)

---

**Document Prepared**: Based on PDF reference material and structural engineering principles

**Version**: 1.0

**Purpose**: Guide development of professional shear force and moment calculator webapp
