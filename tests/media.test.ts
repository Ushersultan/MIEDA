import { test } from 'node:test';
import assert from 'node:assert/strict';
import { youtubeId, validMediaUrl } from '../src/lib/media.ts';
test('accept official watch, short, live, shorts and embed links', () => {
  for (const url of ['https://youtu.be/abcdefghijk?t=3','https://www.youtube.com/watch?v=abcdefghijk&list=abc','https://youtube.com/live/abcdefghijk?si=a','https://m.youtube.com/shorts/abcdefghijk','https://www.youtube.com/embed/abcdefghijk']) assert.equal(youtubeId(url), 'abcdefghijk');
});
test('reject spoofed domains, arbitrary URLs and channel pages', () => {
  for (const url of ['https://youtube.com.attacker.org/watch?v=abcdefghijk','javascript:alert(1)','http://youtu.be/abcdefghijk','https://www.youtube.com/@channel/live','https://youtu.be/short','https://youtu.be/abcdefghijk/extra']) assert.equal(youtubeId(url), null);
});
test('MP4 allows HTTPS signed file URLs, rejects unsafe media', () => {
  assert.equal(validMediaUrl('https://cdn.example.org/video.mp4?token=example', 'mp4'), true);
  for (const url of ['http://example.org/v.mp4','https://example.org/video.html','data:video/mp4,abc']) assert.equal(validMediaUrl(url,'mp4'),false);
});
