interface FlareTreeNode {
  name: String,
  children: FlareTreeNode[],
  data: {
    loc: LanguageLocData,
    git: GitData
  }
}

interface GitData {
  last_update: number,
  age_in_days: number,
  creation_date: number,
  user_count: number,
  users: number[], // dictionary IDs
  details: GitDetails[],
}

interface GitDetails {
  commit_day: number,
  users: number[],
  commits: number,
  lines_added: number,
  lines_deleted: number,
}

interface LanguageLocData {
  language: String,
  binary: Boolean,
  blanks: number,
  code: number,
  comments: number,
  lines: number,
  bytes: number,
}


