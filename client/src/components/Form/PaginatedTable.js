import React from "react";

import {
  Table,
  Pagination,
  PaginationItem,
  PaginationLink
} from "reactstrap";

import { useAlertState } from "context/alert.js";

/*
columns: [
  {title: "a", field: "b"}
],
items: [
  {b: "c"}, {b: "d"}
]
*/

function PaginatedTable({ columns, items, pageSize = 5 }) {
  const pageCount = Math.ceil(items.length / pageSize);
  const [ page, setPage ] = React.useState(0);

  const { setInputOptions } = useAlertState();

  const clamp = (num, min, max) => Math.min(Math.max(num, min), max);

  const back = () => {
    setPage(clamp(page - 1, 0, pageCount - 1));
  };
  const forward = () => {
    setPage(clamp(page + 1, 0, pageCount - 1));
  };

  return (
    <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
      <Table responsive style={{ margin: 0 }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #f1f5f9' }}>
            {columns.map((col, i) => (
              <th key={i} style={{ borderBottom: 'none', color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, padding: '12px 16px' }}>
                {col.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.slice(page * pageSize, (page + 1) * pageSize).map((item, i) => (
            <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
              {columns.map((col, j) => (
                <td key={j} style={{ padding: '14px 16px', borderBottom: 'none', fontSize: '0.875rem', color: '#334155', verticalAlign: 'middle' }}>
                  {col.formatter ? col.formatter(item) : item[col.field] || ""}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </Table>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', flexWrap: 'wrap', gap: '12px' }}>
        <Pagination style={{ margin: 0, gap: '4px' }}>
          <PaginationItem disabled={page === 0}>
            <PaginationLink first onClick={() => setPage(0)} style={{ border: '1px solid #e2e8f0', borderRadius: '6px', color: '#64748b', padding: '6px 10px' }} />
          </PaginationItem>
          <PaginationItem disabled={page === 0}>
            <PaginationLink previous onClick={back} style={{ border: '1px solid #e2e8f0', borderRadius: '6px', color: '#64748b', padding: '6px 10px' }} />
          </PaginationItem>

          <PaginationItem active>
            <PaginationLink onClick={() => setInputOptions({
              title: "Input page number",
              body: "Enter page number below:",
              type: "number",
              button: "Navigate",
              value: `${page+1}`,
              submit: (p) => setPage(clamp(parseInt(p) - 1, 0, pageCount - 1)),
              inputOptions: {
                min: 1,
                max: pageCount
              }
            })} style={{ background: '#6366f1', borderColor: '#6366f1', color: 'white', borderRadius: '6px', padding: '6px 12px', fontWeight: 600 }}>
              {page + 1}
            </PaginationLink>
          </PaginationItem>

          <PaginationItem disabled={page === pageCount - 1}>
            <PaginationLink next onClick={forward} style={{ border: '1px solid #e2e8f0', borderRadius: '6px', color: '#64748b', padding: '6px 10px' }} />
          </PaginationItem>
          <PaginationItem disabled={page === pageCount - 1}>
            <PaginationLink last onClick={() => setPage(pageCount - 1)} style={{ border: '1px solid #e2e8f0', borderRadius: '6px', color: '#64748b', padding: '6px 10px' }} />
          </PaginationItem>
        </Pagination>
        
        <p style={{ fontSize: '0.8125rem', color: '#64748b', margin: 0 }}>
          Showing items <strong>{items.length === 0 ? 0 : page * pageSize + 1}</strong> - <strong>{Math.min((page + 1) * pageSize, items.length)}</strong> of <strong>{items.length}</strong>
        </p>
      </div>
    </div>
  );
}

export default PaginatedTable;