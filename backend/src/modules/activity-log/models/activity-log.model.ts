import { TActivityLogDbRow, TActivityLogResponse, ActivityType, EntityType } from "../types/activity-log.types.js";

export function MapActivityLogRow(row: TActivityLogDbRow): TActivityLogResponse {
  return {
    id: row.id,
    userId: row.user_id,
    sessionId: row.session_id,
    activityType: row.activity_type,
    entityType: row.entity_type,
    entityId: row.entity_id,
    description: row.description,
    ipAddress: row.ip_address,
    userAgent: row.user_agent,
    metadata: row.metadata ? JSON.parse(JSON.stringify(row.metadata)) : null,
    createdAt: row.created_at,
  };
}

export class ActivityLog {
  id: string;
  userId: string | null;
  sessionId: string | null;
  activityType: ActivityType;
  entityType: EntityType;
  entityId: string | null;
  description: string;
  ipAddress: string | null;
  userAgent: string | null;
  metadata: Record<string, any> | null;
  createdAt: Date;

  constructor(data: TActivityLogDbRow) {
    this.id = data.id;
    this.userId = data.user_id;
    this.sessionId = data.session_id;
    this.activityType = data.activity_type;
    this.entityType = data.entity_type;
    this.entityId = data.entity_id;
    this.description = data.description;
    this.ipAddress = data.ip_address;
    this.userAgent = data.user_agent;
    this.metadata = data.metadata;
    this.createdAt = new Date(data.created_at);
  }

  toJSON(): TActivityLogResponse {
    return {
      id: this.id,
      userId: this.userId,
      sessionId: this.sessionId,
      activityType: this.activityType,
      entityType: this.entityType,
      entityId: this.entityId,
      description: this.description,
      ipAddress: this.ipAddress,
      userAgent: this.userAgent,
      metadata: this.metadata,
      createdAt: this.createdAt,
    };
  }
}