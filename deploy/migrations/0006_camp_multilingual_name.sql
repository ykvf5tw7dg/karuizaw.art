-- Match the camp's current four-language brand on https://mori.yoshinn.com/.
-- Only names change; preserve photos, capacity, publication state and applications.
UPDATE content_profiles
SET payload = json_set(payload, '$.names', json_object(
    'zh-Hans', '摩天轮下的森',
    'zh-Hant', '摩天輪下的森',
    'ja', '観覧車下の森',
    'en', 'Ferris Wheel Forest')),
  revision = revision + 1,
  updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
WHERE id = 'forest-private-camp' AND kind = 'space';
