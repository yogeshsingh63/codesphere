import React from "react";
import {
  Button,
  Card,
  CardBody,
  CardTitle,
  CardText,
  Progress,
  Badge,
} from "reactstrap";
import { Link } from "react-router-dom";

function RoomCard({ title, desc, completed, buttons = [], code }) {
  const totalSections = completed?.room?.sections?.length || 0;
  const completedSections = completed?.sections?.length || 0;
  const progress =
    totalSections > 0
      ? Math.min(Math.round((completedSections / totalSections) * 100), 100)
      : 0;

  const isCompleted = completed && progress === 100;

  return (
    <Card className="room-card cs-card mr-3 mb-3">
      <CardBody className="d-flex flex-column justify-content-between p-4">
        <div>
          <div className="d-flex justify-content-between align-items-start mb-2">
            <CardTitle tag="h5" className="cs-card-title mb-0">
              {title}
            </CardTitle>
            {isCompleted && (
              <Badge color="success" className="cs-badge-success">
                <i className="fas fa-check-circle mr-1"></i> Completed
              </Badge>
            )}
            {code && !isCompleted && (
              <Badge color="dark" className="cs-badge-code">
                {code.slice(0, 8)}
              </Badge>
            )}
          </div>
          <CardText className="cs-card-desc mb-3">
            {desc || "No description provided."}
          </CardText>
        </div>

        <div>
          {completed && (
            <div className="cs-progress-wrapper mb-3">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <span className="cs-progress-label">
                  {completedSections} / {totalSections} sections
                </span>
                <span className="cs-progress-percent">{progress}%</span>
              </div>
              <Progress
                className="cs-progress-bar"
                max="100"
                value={progress}
              />
            </div>
          )}

          <div className="d-flex flex-wrap gap-2 pt-2">
            {buttons &&
              buttons.map((button, i) => {
                const isLink = Boolean(button.to);
                return (
                  <Button
                    key={i}
                    size="sm"
                    color={button.color || "info"}
                    className={`cs-btn cs-btn-${button.color || "info"} mr-2 mb-1`}
                    tag={isLink ? Link : "button"}
                    to={button.to}
                    onClick={(e) => {
                      if (button.onClick) {
                        button.onClick(title);
                      }
                    }}
                  >
                    {button.text}
                  </Button>
                );
              })}
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

export default RoomCard;