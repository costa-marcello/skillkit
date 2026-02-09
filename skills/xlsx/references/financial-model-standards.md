# Financial Model Standards

Apply these conventions when building or editing financial models. User or template conventions override everything below.

## Color Coding

| Colour | RGB | Meaning |
|--------|-----|---------|
| Blue text | 0,0,255 | Hardcoded inputs and scenario toggles |
| Black text | 0,0,0 | Formulas and calculations |
| Green text | 0,128,0 | Links from other worksheets in same workbook |
| Red text | 255,0,0 | External links to other files |
| Yellow background | 255,255,0 | Key assumptions needing attention |

## Number Formatting

| Data Type | Format | Notes |
|-----------|--------|-------|
| Years | Text string | "2024" not "2,024" |
| Currency | `$#,##0` | Specify units in headers: "Revenue ($mm)" |
| Zeros | Dash | `$#,##0;($#,##0);-` including percentages |
| Percentages | `0.0%` | One decimal default |
| Multiples | `0.0x` | EV/EBITDA, P/E |
| Negative numbers | Parentheses | (123) not -123 |

## Assumptions Placement

Place all assumptions (growth rates, margins, multiples) in separate cells. Reference those cells in formulas.

```python
# Use =B5*(1+$B$6) instead of =B5*1.05
sheet['C5'] = '=B5*(1+$B$6)'
```

## Hardcode Documentation

Add source comments for every hardcoded value. Format: "Source: [System], [Date], [Reference], [URL if applicable]"

Examples:
- "Source: Company 10-K, FY2024, Page 45, Revenue Note, [SEC EDGAR URL]"
- "Source: Bloomberg Terminal, 8/15/2025, AAPL US Equity"
- "Source: FactSet, 8/20/2025, Consensus Estimates Screen"
