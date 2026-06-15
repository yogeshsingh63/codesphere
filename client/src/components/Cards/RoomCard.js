import React from "react";

import {
  Button,
  Card,
  CardBody,
  CardTitle,
  CardText,
  Progress 
} from "reactstrap";

import { Link } from "react-router-dom";

function RoomCard({ title, desc, completed, buttons = [] }) {
  let progress;
  if(completed) {
    progress = (completed.sections.length/completed.room.sections.length)*100;
  }
  return (
    <Card className="room-card mr-3 mb-3" style={{ width: '20rem', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
      <CardBody>
        <CardTitle tag="h4" style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '8px' }}>
          {title} {completed && progress === 100 && <i className="fas fa-check-circle text-success ms-2" style={{ marginLeft: '8px' }}></i>}
        </CardTitle>
        <CardText style={{ color: '#64748b', fontSize: '0.875rem', lineHeight: 1.6 }}>
          {desc}
        </CardText>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {buttons && buttons.map((button, i) => {
            return button.to ? (
              <Button
                key={i}
                color={button.color || "primary"}
                size="sm"
                onClick={e => {button.onClick && button.onClick(title)} }
                tag={Link}
                to={button.to}
              >
                {button.text}
              </Button>
            ) : (
              <Button
                key={i}
                color={button.color || "primary"}
                size="sm"
                onClick={e => {button.onClick && button.onClick(title)} }
              >
                {button.text}
              </Button>
            )
          })}
        </div>
        {completed && (
          <div className="progress-container mt-3">
            <Progress max="100" value={progress} style={{ height: '6px', borderRadius: '3px' }}>
              <span className="progress-value" style={{ fontSize: '0.75rem', color: '#64748b' }}>{parseInt(progress) || 0}%</span>
            </Progress>
          </div>
        )}
      </CardBody>
    </Card>
  )
}

export default RoomCard;