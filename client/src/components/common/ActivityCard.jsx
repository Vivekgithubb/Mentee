import React from 'react';
import { Calendar, MessageSquare, Paperclip, Mail, MapPin } from 'lucide-react';
import { Badge } from './Badge';

export const ActivityCard = ({
  badgeText = "New",
  badgeVariant = "dark",
  title,
  description,
  date,
  commentCount,
  attachmentCount,
  isFeaturedDark = false,
  contactEmail,
  location,
  assignee,
  onClick,
  className = ""
}) => {
  if (isFeaturedDark) {
    return (
      <div
        onClick={onClick}
        className={`bg-brand-dark text-white rounded-2xl p-5 border border-[#2B2E33] shadow-dark-float flex flex-col gap-3 cursor-pointer hover:-translate-y-1 transition-all duration-200 ${className}`}
      >
        <div className="flex items-center gap-2">
          <Badge variant="white">{badgeText}</Badge>
        </div>

        <h4 className="text-base font-bold text-white tracking-tight">
          {title}
        </h4>

        <p className="text-xs text-[#ACB2BD] leading-relaxed">
          {description}
        </p>

        {(contactEmail || location) && (
          <div className="flex flex-col gap-1.5 py-1 text-[11px] text-[#CBD0D8]">
            {contactEmail && (
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-brand-peach" />
                <span>{contactEmail}</span>
              </div>
            )}
            {location && (
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-brand-peach" />
                <span>{location}</span>
              </div>
            )}
          </div>
        )}

        {assignee && (
          <div className="flex items-center gap-3 py-2 border-t border-b border-white/10">
            <img
              src={assignee.avatar}
              alt={assignee.name}
              className="w-8 h-8 rounded-full object-cover border border-white/20"
            />
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-white">{assignee.name}</span>
              <span className="text-[10px] text-[#9298A4]">{assignee.role}</span>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs text-[#9AA0AC] font-medium">
          {date && (
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>{date}</span>
            </div>
          )}
          <div className="flex items-center gap-3">
            {commentCount !== undefined && (
              <span className="flex items-center gap-1">
                <MessageSquare className="w-3.5 h-3.5" />
                {commentCount}
              </span>
            )}
            {attachmentCount !== undefined && (
              <span className="flex items-center gap-1">
                <Paperclip className="w-3.5 h-3.5" />
                {attachmentCount}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl p-5 border border-brand-gray-light/60 shadow-editorial flex flex-col gap-2.5 cursor-pointer hover:-translate-y-1 hover:shadow-editorial-hover transition-all duration-200 ${className}`}
    >
      <div className="flex items-center gap-2">
        <Badge variant={badgeVariant}>{badgeText}</Badge>
      </div>

      <h4 className="text-base font-bold text-brand-dark tracking-tight">
        {title}
      </h4>

      <p className="text-xs text-brand-dark/70 leading-relaxed">
        {description}
      </p>

      <div className="flex items-center justify-between pt-3 border-t border-brand-gray-light/40 text-xs text-brand-gray font-medium">
        {date && (
          <div className="flex items-center gap-1.5 text-brand-dark/80 font-medium">
            <Calendar className="w-3.5 h-3.5" />
            <span>{date}</span>
          </div>
        )}
        <div className="flex items-center gap-3">
          {commentCount !== undefined && (
            <span className="flex items-center gap-1 text-brand-dark/70">
              <MessageSquare className="w-3.5 h-3.5" />
              {commentCount}
            </span>
          )}
          {attachmentCount !== undefined && (
            <span className="flex items-center gap-1 text-brand-dark/70">
              <Paperclip className="w-3.5 h-3.5" />
              {attachmentCount}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
