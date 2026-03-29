const hashtagRegex = /(^|\s)#([a-zA-Z0-9_]+)/g;
const mentionRegex = /(^|\s)@([a-zA-Z0-9_]+)/g;

const extractHashtags = (text = '') => {
  const tags = [];
  text.replace(hashtagRegex, (_, s, tag) => tags.push(tag.toLowerCase()));
  return [...new Set(tags)];
};

const extractMentions = (text = '') => {
  const mentions = [];
  text.replace(mentionRegex, (_, s, tag) => mentions.push(tag.toLowerCase()));
  return [...new Set(mentions)];
};

module.exports = { extractHashtags, extractMentions };
