import { Schema, model, Document, Types } from "mongoose";

export interface IAIMessage {
  role: "user" | "assistant";
  content: string;
  createdAt: Date;
}

export interface IAIConversation extends Document {
  userId: Types.ObjectId;
  messages: IAIMessage[];
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new Schema<IAIMessage>(
  {
    role: { type: String, enum: ["user", "assistant"], required: true },
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const aiConversationSchema = new Schema<IAIConversation>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    messages: { type: [messageSchema], default: [] },
  },
  { timestamps: true }
);

export const AIConversation = model<IAIConversation>("AIConversation", aiConversationSchema);
