#!/bin/bash
git filter-branch -f --env-filter '
    GIT_AUTHOR_NAME="april1433"
    GIT_AUTHOR_EMAIL="aprilbingtan7303@gmail.com"
    GIT_COMMITTER_NAME="april1433"
    GIT_COMMITTER_EMAIL="aprilbingtan7303@gmail.com"
' -- --all
