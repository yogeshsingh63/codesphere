import React from "react";
import {
  Button,
  Card,
  CardBody,
  CardTitle,
  CardText
} from "reactstrap";
import { Link } from "react-router-dom";

function SectionCard({ title, desc, onClick = () => {}, onDelete = null, to, button = "Edit" }) {
  return (
    <Card className="room-card mr-3 mb-3" style={{ width: '20rem', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
      <CardBody style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <CardTitle tag="h4" style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '8px' }}>
          {title}
        </CardTitle>
        <CardText style={{ color: '#64748b', fontSize: '0.875rem', lineHeight: 1.6, flexGrow: 1 }}>
          {desc}
        </CardText>
        
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: 'auto' }}>
          {to ? (
            <Button
              color="primary"
              size="sm"
              onClick={e => onClick(title)}
              tag={Link}
              to={to}
              style={{ fontWeight: 600, borderRadius: '8px' }}
            >
              {button}
            </Button>
          ) : (
            <Button
              color="primary"
              size="sm"
              onClick={e => onClick(title)}
              style={{ fontWeight: 600, borderRadius: '8px' }}
            >
              {button}
            </Button>
          )}
          
          {onDelete && (
            <Button
              color="danger"
              size="sm"
              onClick={e => onDelete(title)}
              style={{ fontWeight: 600, borderRadius: '8px' }}
            >
              Delete
            </Button>
          )}
        </div>
      </CardBody>
    </Card>
  );
}

export default SectionCard;