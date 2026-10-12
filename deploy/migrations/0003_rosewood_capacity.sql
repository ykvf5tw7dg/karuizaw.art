-- User confirmed Rosewood Inn accommodates 6–10 guests on 2026-10-12.
-- Preserve every other profile field and all application records.
UPDATE content_profiles
SET payload = json_set(payload,
  '$.sleepingCapacity', 6,
  '$.sleepingCapacityMax', 10,
  '$.internalNotes', replace(replace(coalesce(json_extract(payload, '$.internalNotes'), ''),
    '住宿人数与禅修活动人数均需确认。', '禅修活动人数需按空间与活动确认。'),
    '住宿人数冲突：页面与结构化数据为8，正文为6；公开信息保持待确认。',
    '住宿人数由用户于2026-10-12确认为6–10人；此次确认优先于旧房源中的人数信息。')),
  revision = revision + 1,
  updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
WHERE id = 'rosewood-inn' AND kind = 'space';

-- User selected the existing fourth (panoramic outdoor-space) photograph as cover.
-- Match the known order so later admin photo edits are never blindly shuffled.
UPDATE content_profiles
SET payload = json_set(payload, '$.photos', json_array(
    json_extract(payload, '$.photos[3]'), json_extract(payload, '$.photos[0]'),
    json_extract(payload, '$.photos[1]'), json_extract(payload, '$.photos[2]'))),
  revision = revision + 1,
  updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
WHERE id = 'forest-private-camp' AND kind = 'space'
  AND json_extract(payload, '$.photos[0].id') = 'exterior'
  AND json_extract(payload, '$.photos[3].id') = 'outdoor-space'
  AND json_array_length(payload, '$.photos') = 4;
