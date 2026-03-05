# 실습 따라하기

## Section 1 : Setup Environments (on MacOS)

1. install visual studio code
2. install nodejs and npm
3. vs code extension 설치
    - claude code/Anthropic
    - eslint/Microsoft
    - git graph/mhutchie
    - python */Microsoft
    - vscode-icons/VSCode Icons Team
4. 환경변수에 NODE_TLS_REJECT_UNAUTHORIZED=0 (kt_dev)
5. install git and gh(거의 필요 없음)
6. install claude code(https://claude.com/product/claude-code)
7. vscode에서 command+shift+p -> 'Preferences: Open User Settings' -> 검색에 meta 입력해서 'Terminal > Integrated: Mac Option Is Meta'에 check
    - claude code를 사용하다 보면 meta + o 같은 걸 치라고 나옴.
    - iterm에서 claude code를 쓰려면 여기서도 설정 필요(방법은 google ai 검색)



## Section 2 : Project Setup

### 1. Next JS project setup

```shell
npx create-next-app@latest liftingdiarycourse
# customize settings 선택
# Typescript(yes), ESLint(yes), React Compiler(no), Tailwind CSS(yes), src (yes), App Router(yes), import alias(No)
# liftingdiarycourse 에서 vs code open
```

### 2. claude code setup

- claude prompt에 회색으로 되어 있는 예정 명령어가 보이는 상태에서 Enter를 치면 실행이 되어 버리니까 조심해야 함.
- 여기서 배운 shortcut
    - /theme, /login, /config
    - /terminal-setup : keyboard 입력에서 multiline 입력(shift+enter)이 가능하도록 설정하는 것. 중요한 setup
    - /model : Default Sonnet 에다가 Low effort 선택이 합리적 선택
    - **/init** : CLAUDE.md 생성함. 현재 구조를 살펴서 만들어 냄.
- 반드시 **자주** commit 하자
- claude code가 파일에 손을 대기 시작하면 그 때부터는 shift+tab을 통해서 edit mode, plan mode, ask mode로 적절히 바꿔줘 가면서 사용하는 것이 좋다.

### 3. 인증 추가(clerk.com)

1. clerk.com에 가서 가입 후 app 등록
2. claude에게 인증을 붙이라고 시킴
    - [Prompt는 여기 있음][clerk ai prompts]
    - Prompt를 복사해다가 claud code에 붙여넣는 방식으로 명령 실행
3. [clerk dashboard][clerk dashboard]에서 API keys 부분을 찾아서 .env.local에 붙여 넣음
4. 실행(```npm run dev```)해보고 이상 없으면 commit
5. page에 몇가지 수정(아래 prompt를 claude code에 입력).
    ```prompt
    Change Application Title and Desctiption and Change Page Layout including Authentication link like('Sign in' and 'Sign up')                            
        1. Title : Lifting Diary
        2. Description : Plan, Execute and Review your Exercise with this application
        3. Title should appear in left
        4. Authentication Link should appear in right
    ```
6. 원하는 대로 나오는 것을 확인 후 commit
7. sign in button을 modal로 바꾸기
sign in 버튼을 누르면 auth server로 redirect된다. 이를 redirect되지 않고 modal window에서 처리하도록 만드는 것이 목적
    - layout.tsx부분인 것을 알고 있는 경우에는 그 부분을 block으로 선택하면, claude code의 vs extension은 내가 선택한 부분을 알 수 있기 때문에(claude code 상태바에 4줄 선택되었다고 나옴) 좀 더 쉽게?(token 덜사용?) 수정할 수 있다.
    - 수정하기에 앞서 먼저 물어보고 실행을 해보자. shift+tab을 통해 ask mode로 바꾼 후 prompt에 ```is it possible to launch the sign in and sign up with clerk via a modal?```
    - /clear 를 통해 적절하게 context를 초기화 하자. 하나의 feature를 만들고 나면 초기화 하는 것이 좋다. 그 전에 /context 를 통해 사용량이 얼마인지를 볼 수 있음. context window가 full되면 CLAUDE.md 등의 prompt가 빠질 수가 있다.

### 4. PostgreSQL Setup

1. neon.com에 가입
2. project 생성
    - name : liftingdiary
    - aws singapore
    - database version 17
3. db schema는 drizzle(orm)을 통해 만들 것임

### 5. setup drizzle

1. [drizzle neon]으로 이동
2. 이 페이지를 전부다 긁어다가 claude code에 넣어서 install을 하라고 시킬 수도 있지만 project setup은 manual하게 하자.
3. .env.local을 .env로 수정해서 함께 사용
4. src/db 폴더를 만들어서 거기에 index.ts를 만듬
    - DATABASE_URL뒤에 !를 붙이면 에러가 없어짐.
    - ```export { db }; ``` 추가
5. schema.ts 적용은 claude 시킬 것임
6. drizzle.config.ts 생성
    - 여기서 schema.ts파일을 reference하므로 schema.tx 파일만 만들어 둠.
7. ```npx drizzle-kit push```는 나중에

### 6. UI setup
UI는 [shadcn]을 이용할 것임.
1. ```npx shadcn@latest create```
2. ```npx shadcn@latest init```
3. commit 빼먹지 말 것

### 7. db schema 생성
이 부분은 일단 planning mode로 시작(shift+tab)
```prompt
this is a workout logging app. plan a table schema to log workouts, each workout can have multiple exercises, and each exercises can have multiple sets. make user this is normalized. the schema must be created using drizzle orm for a postgres db hosted on neon.
```

1. 위와 같이 했더니, 'Users' table이 빠져있음. 그래서 다시 prompting.

```prompt
Design Users table. It contains userId from Clerk logged in. There should be a relation between Users and Exercises table. 
```

2. 강좌에 의해서 아래와 같이 재차 수정

```prompt
It just nees a few tweaks.
1. Add startdAt and completedAt columns and remove notes column for the workouts table 
```

3. 재수정
```prompt
rename orderIndex column name to order in workout_exercieses table
```

4. 'auto-accept edits'를 선택해서 진행

5. commit

### 8. dummy data 생성
1. [drizzle neon]의 ```npx drizzle-kit push``` 실행
2. [Neon console]에서 database table 확인
2. sample data를 위해 app sign up을 통해 clerk에 사용자 생성
    - ```npm run dev```
    - sign up
    - [clerk dashboard]에서 sign up 한 사용자를 click해서 'User ID'확인하고 복사
3. Neon MCP setup
    1. [Neon MCP Docs]에서 neonctl 말고 MCP만 설치하면 됨. ```npx add-mcp https://mcp.neon.tech/mcp```
    2. claude 재실행 : .mcp.json에 있는 것이 바로 적용이 안되었음(재시작시 option에 의해 바로 사용 가능할 듯)
    3. /mcp -> neon 선택해서 authentication. 이 때 'full access' 권한도 함께 줘야 함.
    4. claude에게 db table list를 물어봐서 연결 테스트.
    ```prompt
    neon의 liftingdiary db에 있는 table 목록을 알려줘
    list all of the available tables within the liftingdiary db on neon
    ```
4. dummy data 생성
    - plan mode로 바꿈
    - user id 복사해 옴
    - 아래 명령
    ```prompt
    generate some example data for the above tables for user id user_3A97gVqqo6DDw5vsfJEv4tmoPuF. do not insert any data just yet into the neon database. I want to check the example data first.
    ```
    - 실제 sql을 보여달라하면 약간 틀린 부분이 있을 수 있으니 수정하라고 시킴.
    - accept and edit 선택 후 실행 선택


## Section 3 Generate Code with Claude Code

### 1. Dashboard 페이지 만들기
로그인한 사용자가 날짜를 선택하면 그 날의 workout(운동세션)을 리스트 해 줌.

1. clear claude code context
2. git branch 생성 ```git checkout -b dashboard-page```

3. 아래 prompt로 생성 시작
```prompt
implement a /dashboard page which will contain a datepicker that defaults to the current date. this page will load all the logged workouts for the date displayed in the datepicker.
```
    - note: 지금 이렇게 만든 것을 그대로 쓸 수 있지는 않을 것임. 왜냐하면 지금까지 만든 codebase를 기반으로 만들라는 말도 안했고, shadcn을 이용하라는 구체적인 지침도 없음.
    - note : 그 새 발전해서 code를 탐색해서 shadcn을 이용하는 모습을 보여줌.
    - note : 샘플 workouts session기록이 보여지지 않아서 아래와 같이 prompt를 썼는데, 먼저 sql을 가지고 user_id 관련 query를 스스로 해보더니 실제 문제는 date conversion 문제였다고 하면서 제대로 수정해 줌. 'sample data'를 체크해 보겠다는 것으로 봐서는 어딘가에 history를 long term memory로 저장해 두는 것 같음.

```prompt
no workouts are displayed. It is because of the userId. after logged in, You should map user_id in workouts value with clerk_id in users table first.
```
    - note: 저자가 만들었을 때에는 아래와 같은 오류들이 있었음.
    - a. shadcn을 제대로 적용하지 않음.
    - b. date관련하여 약간의 javascript 오류가 있음(무시가능)
    - c. 심각한 부분은 route.ts였는데 여기에서는 parameter로 date와 userId를 받아냄. 이렇게 되면 userId를 parameter변조를 통해서 다른 사람의 workout을 볼 수 있는 보안 위협이 있음.
    - 위 모든 내용은 지금은 발생하지 않았음. route.ts자체가 없음. route.ts는 server side에서 request를 handling할 수 있는 route handler임.

### 2. doc 파일을 이용해 Claud Code의 output 제어하기
우리는 경험하지 못했지만 위와 같은 문제를 doc 파일을 통해 해결할 수 있다.

```prompt
create a docs/ui.md file outlining the coding standards for the ui throughout this entire project. the document should outline that ONLY shadcn ui components should be used for the ui in this project. ABSOLUTELY NO custom components should be created, ONLY use shadcn ui components.

date formatting should be done via date-fns. dates should be formatted like the following:
1st Sep 2025
2nd Aug 2025
3rd Jan 2026
4th Jun 2024
```

- /clear

- ui.md가 만들어진 후 추가적으로 CLAUDE.md도 수정
```prompt
update the CLAUDE.md file to highlight that all code generated by claude code should ALWAYS first refer to the relevant docs file within the /docs directory.
```
- 저자는 아래와 같이 dashboard를 새로 생성함
```prompt
create a /dashboard page with a datepicker set to the current date. this page should also show a list of workouts logged for the date within the datepicker. ONLY generate the UI for this page. DO NOT generate any data fetching or server side code just yet. JUST focus on the UI.
```

- feature branch merge
```prompt
merge current branch into main branch and remove current feature branch
```

### 3. 실제 데이타 가져오도록 doc을 생성하고 workout query 만들기

- /clear

최소한의 requirement로는 
1. data fetching을 할 때에는 server component를 사용.
2. data layer를 따로 두고, 거기에는 다양한 data를 qeury를 할 수 있도록 helper function이 있어야 함

```prompt
create a new docs/data-fetching.md file and highlight that ALL data fetching within this app should be done via server components. data should NOT be fetched via route handler, or via client components, or any other way, ONLY via server components. This is incredibly important. 
database queries must ALWAYS be done via helper functions within the /data directory. these helper functions must use drizzle ORM to query the database. DO NOT USE RAW SQL. It's incredibly important that a logged in user can ONLY access their own data. They SHOULD NOT be able to access any other data other than their own.
```

- CLAUDE.md 파일에 만들어진 data-fetching.md를 list하고
- /clear

```prompt
implement the data fetching for workouts for the currently logged in user for the dashboard page and remove any dummy data within that page
```

### 4. 몇가지 수정 사항
course에서 저자의 결과가 나와 다른 점
1. date picker가 펼쳐져 있음(나의 경우 popup방식)
2. date 선택시 workout list가 나오지 않음(나의 경우 나옴)
3. 나의 경우 date가 하루 밀림. 즉 17일을 선택하면 16일이 선택됨.
4. 나의 경우 date picking을 한 이후에 다시 다른 날짜를 선택하려고 하는데 calendar에는 오늘 날짜가 들어있는 월을 보여줌. 마지막으로 선택한 날짜가 포함된 월을 보여줘야 함.
5. 날짜 선택하는 date picker가 펼쳐지도록 만들어지도록(DatePicker 대신 Calendar를 직접 사용)
6. Calendar에 workout을 수행한 날짜는 아래에 조그마한 점을 찍었으면 함

- option + t 혹은 /config를 통해 Thinking mode를 enable. thinking mode의 품질이 일반적으로 조금 더 좋고 token을 좀 더 많이 사용함
- edit mode를 default mode로 바꿈(shift + tab)

#### 3번 수정

```prompt
I want you to outline a plan on how to fix the issue in the /dashboard page @src/app/dashboard/page.tsx where whenever a new date is selected in the calendar the previous date's data are loaded.
```

위와 같이 prompt를 쓰니 fetch가 mouse click event에 의해서 현재의 날짜가 fetch가 안되는 것인 줄 알고 그렇게 수정하려고 해서 prompt를 새롭게 씀

```prompt
no. I guess you misunderstand what I meant. When I select '13-Feb-2026', The page tried to fetch '12-Feb-2026'.
```

위와 같이 했더니 날짜를 연/월/일로 String parsing을 해서 날짜를 새롭게 조합하는 코드를 만들어 내어서 아래와 같이 다시 명령함

```prompt
Isn't there any method in date-fns library that change the user selected local date to UTC? your code looks not good.
```

#### 4번 수정
```prompt
After picking a specific date, the result page date picker's current date is set to today's month. Date picker should shows the month of current date if date param is missing but Date picker should shows the month of date param.
```

#### 5번 수정
```prompt
@src/app/dashboard/page.tsx Change Date Picker are in left and workout list is in right 
```

#### 6번 수정
```prompt
In the inline calendar, there should be a dot indicator for each date if there is one or more workouts. If user clicks next or previous month arrow in calendar, the calendar shows dot indicator for each date also if there is one or more workouts.
```
- 아무리 해도 안되서 model을 opus로 바꾸고 high 로도 바꿈.
바꿔서 구현 성공
    - 안되서 재시도를 할 수 있도록 git branch와 commit을 잘 활용해야 함(다음 장).


### 5. git branch와 merge를 자동화
새로운 workout 입력하는 기능을 git branch를 통해서 구현할 것임.

claude에서 git action에 대해서 'always accept during this session' 같은 걸 선택할 때마다 저자의 환경에서는 .claude/settings.local.json 파일에 계속해서 쓰기 때문에 git action을 할 때마다 git add할 파일이 변경이 되는 상황이 되어서 오류가 발생함. 나의 환경에서는 이미 claude가 version up이 되었는 지 모르겠지만 .claude 폴더자체가 project home에 존재하지 않음. -> 만약 .claude가 있다면 .gitignore에 추가해야할 듯.

#### 1. 데이타 수정(mutation)에 대한 docs 파일 생성

팁1 : claude code가 작업을 할 동안 우리는 기다릴 필요가 없다. prompt를 입력하고 enter를 치면 claude code는 작업을 한다. 이 때 enter를 또 치면 우리는 다른 prompt를 또 입력을 할 수 있다. 이렇게 하면 prompt는 queueing이 된다. 이렇게 sequential하게 처리를 하게 할 수도 있지만 claude code instance가 여러개 실행되어서 동시에 작업을 하게할 수도 있다.
- 하지만 하나의 feature에서 여러개의 claude code가 실행되는 것은 그렇게 바람직하지 않다. 같은 파일을 여러 instance가 수정을 하게 하는 것은 사람이 팀으로 작업할 때에도 바람직한 것은 아니다.

아래 2개의 prompt는 명확하게 별도의 파일을 만드는 것이므로 claude를 하나 더 열어서 양쪽에 prompt를 입력하고 동시에 enter를 친다.

두 개의 claude가 실행되더라도 IDE와 연결된 것은 하나이다.

```prompt
create a new auth.md documentation file in the /docs directory. this file should highlight the coding standards for everything to do with auth in this app, specifically that this app uses clerk for authentication.
```

```prompt
create a data-mutations.md documentation file for the coding standards for everything to do with data mutations in this app. Specifically data mutations MUST be done via helper functions with the src/data directory which wrap db calls via drizzle orm. all data mutations MUST be done via server actions within colocated files named actions.ts. all server actions params must be typed and should NOT have the FormData data type. ALL server actions MUST validate the arguments passed to them via zod.
```

#### 2. create new workout 기능 생성

```prompt
create a new page at /dashboard/workout/new with a form to create a new workout.
```

하루 앞의 날짜로 new workout이 생성됨.

```prompt
If I select 4-Mar-2006 for a new workout, 3-Mar-2006 is inserted for the new workout.
```

date string을 가져와서 YYYY-MM-dd 로 parsing을 해서 보내는 식으로 수정을 하길래 앞서 수정한 것처럼 고치라고 함

```prompt
instead of your fixing plan "to pass the date as a local date string (YYYY-MM-DD) instead of a Date object", how about using formatISO function like formatISO(newDate, { representation: 'date' }). Isn't it possible? 
```

위 내용을 data-mutations.md에 추가하라고 함.

```prompt
add into the docs/data-mutations.md file a rule that says use formatISO to pass correct date to drizzle orm regardless of the server's timezone.
```

- commit and clear

#### 3. add custom slash command

custom slash command란 똑같은 prompt를 실행하는 것임.

.claude/merge-and-create-branch.md 파일 생성후 아래를 입력
```prompt
add and commit any changes in the current branch and provide a suitable commit message based on the code changes. then merge the current branch into the $1 branch and resolve any issues off the back of that merge. then create a new branch called $2
```

- claude code restart
- /merge-and-create-branch main edit-workout-page 실행

#### 4. edit workout 구현

```prompt
create a new page at /dashboard/workout/[workoutId] this page will be the edit / update workout page.
```

sample로 들어간 data의 모든 uuid가 잘못된 형식이어서 zod가 validation하면서 오류를 뱉어냄. error를 넣고, data를 수정하라고 말함.

추가적으로 수정해야할 기능은 아래와 같음.
- 수정한 workout이 있는 날짜의 dashboard로 돌아가야함.
- dashboard에서 workout을 수정할 버튼이 없음(workout을 클릭하면 수정하는 페이지로 이동해야 함)
- 수정을 하면 수정했다는 표시가 나오지 않음.


### 6. subagent 활용
prompt에 의한 특정 결과를 바탕으로 특정 작업이 자동으로 실행이 되도록 subagent를 만든다.
여기서는 예제로 새로운 documentation을 docs 폴더에 만드는 custom slash command를 만들고 이를 통해 파일이 생성되면 이를 인지하여 CLAUDE.md 파일에 자동으로 추가하도록 한다.(실제로는 claude code가 doc 파일을 만들면 알아차리고 CLAUDE.md도 update하겠느냐고 미리 prompt가 생성되기는 함)

1. .claude/commands/create-docs.md 생성
2. 내용을 아래와 같이 입력/저장 후 claude code restart
```prompt
create a new documentation file at docs/$1.md to highlight the coding standards for this layer of the app, specifically the codding standards need to highlight: $2
```

3. /agents 입력후 enter
    1. Create new agent 선택
    2. Project 선택
    3. Generate with Claude 선택
    4. prompt 입력 ```whenever a new documentation file is added into the /docs directory, update the CLAUDE.md file to reference this new file within the list of documentation files under the ## Documentation section```
    5. Read-only tools 와 Edit tools만 선택하면 됨.
    6. Continue 선택
    7. 간단한 동작이므로 Haiku 선택해도 될 것 같지만 그냥 Sonnect 선택
    8. 색깔은 아무거나(파란색)
    9. agent memory도 그냥 default로 선택
    10. agent 생성후 빠져나감.
    11. 이름이 claude-md-docs-sync로 만들어지는데, 'docs-reference-updater'가 더 적절한 것 같음. 파일명과 파일 내용 중 name 항목을 바꿈
    12. 이름을 바꾸면 claude 재시작 해야하는 듯.

4. test 해봄

```shell
/create-docs routing\
all routes in this app should be accessed via /dashboard. the /dashboard page and any sub pages should be protected routes that are only accessible by logged i users. route protection should be done via the next js middleware.
```

- tool 호출 시 invalid tool parameters 오류가 나지만 원하는 대로 실행 됨.


## Section 4 Advanced automations with Github Actions

### 1. Vercel에 deploy

1. github.com을 remote repository로 설정하지 않았다면 remote/origin으로 설정
    1. brew install gh 를 통해 github cli 설치(option)
    2. gh auth login
    ```shell
    git remote add origin https://github.com/msjo66/liftingdiarycourse.git
    git branch -M main
    git push -u origin main
    ```
2. vercel.com 에 sign-in/sign-up
3. add a new project
    1. import git
    2. 'Deploy' 버튼 누르기 전에 Environment Variables 항목에 우리의 .env의 항목을 넣을 것.(ctrl+c, ctrl+v 동작이 ui에서 됨)
    3. deploy후 continue to dashboard 클릭
    4. Domains 아래에 있는 link를 click해서 동작하는 지 확인
4. 새로운 branch deployment test
    1. 'change-landing-page' 생성 후 claude에서 아래와 같이 구현하여 branch push
    ```prompt
    make /dashboard as landing page if user is authenticated.
    ```
    2. vercel deployments에 자동으로 branch가 'Preview'상태로 deploy되는 지 확인
    3. Preview 상태의 Deployments를 클릭하면 Preview에 접근할 수 있는 Domain이 보임. 이 domain에는 vercel에 로그인이 되어 있는 사용자만 볼 수 있음.
    4. main에 merge하고 main을 다시 github에 push해 보면 main에 반영된 것을 볼 수 있음

### 2. Github Action에 Claude Code 설정

1. /install-github-app : claude.ai의 profile 페이지로 redirect되면 끝난 것임.
    - long lived token 생성을 선택함
    - 마지막으로 github pr 페이지가 나옴. review후 main으로 merge해야 함. github workflow가 생성되어 있음.

### 3. Github issue를 claude code로 fix하기

여기서는 vs code를 사용하는 경우는 없다. 모든 것은 github page에서 이루어진다.
- 일단 main을 포함해서 remote repository에 있는 모든 branch를 local로 sync를 맞추고 모두다 main과 commit head를 일치시킨다.

- 강의에서는 4.1.4를 github에서 issue로 등록함. 등록이후 issue review페이지에서 ```@claude implement this``` 라고 입력을 하고나면 claude가 plan -> new branch -> vercel까지 되는 것을 볼 수 있음.

#### 추가 issue raise and fix

1. vercel에 deploy된 main branch를 테스트 해본다. log out 된 상태에서 /dashboard 를 접속하면 오류가 발생한다. vercel dashboard에 가보면 Logs라는 tab이 있고, Unauthorized 오류가 기록되어 있다. 이 오류를 github issue에 등록한다.
    - issue title : Accessing /dashboard while being logged out results in Application Error
    - description : 복사한 오류와 함께 'The /dashboard page and any subpages from the /dashboard page must be protected routes.'라고 입력

2. Add a comment에 ```@claude fix this issue``` 라고 입력하고 comment 저장.
    - 기능을 vercel에서 테스트 해보면 logout 상태에서 /dashboard로 접속하면 login page(clerk)으로 redirect된다.(이것까지 고치는 것도 issue에 comment로 추가해서 @claude에게 시키면 되겠지만 생략) 

3. issue 하나 더 등록 후 구현 시키기
    - issue title : Use shadcn ui buttons for the sign in and sign up buttons

4. 또다른 이슈 등록 후 구현 시키기
    - issue title : Make the entire site dark mode

5. 기능 추가 이슈 등록 후 구현 시키기
    - issue title : Make the workouts clickable on the /dashboard page
    - issue description : Each workout must be a link that navigates the user to /dashboard/workout/[workoutId]

6. 각각의 issue가 제대로 처리되었는 지 vercel에서 동작 확인
7. 각각의 issue에서 무엇이 수정되었는 지 github에서 확인(각 issue의 branch에서 '1 commit ahead of main'을 클릭)
9. 7번에서 각각 pull request 생성. 생성하면 자동으로 claude code action(code review)가 수행되는 것이 보여짐
10. merge 후 'Delete branch' 수행
11. merge를 하게 되면 vercel에 main이 redeploy되는 것도 확인

12. vs code가 열려 있다면 github과 동기화
    - 만약 동기화이후 npm run dev를 했을 때 node module이 없어서 오류가 발생할 수 있다(혹시 버튼 같은 component를 사용하지 않았었다면). 이 때는 ```npm i```를 통해서 없는 module을 local로 download할 수 있다.

위의 이슈들은 아주 간단한 것이기 때문에 vs code 없이해도 될 정도이지만 새로운 workout 만들기 버튼, workout내에 exercise를 추가하거나 수정하는 기능 등은 제법 복잡하다. 이런 경우에는 github에서 작업하는 것을 추천하지는 않는다.

## Section 5 Extras
### 1. calendar UI 개선
제목은 calendar UI 개선이지만, 예전 section에서 opus를 쓰면서까지 수정을 했기 때문에 calendar UI는 개선하지 않는다. 대신 workout 입력 버튼을 만든다.

```prompt
display the log new workout button on the /dashboard page.
```

선택한 날짜에 상관없이 오늘 날짜로 받기 때문에 문제가 있음.

```prompt
'Log New Workout' Button always go to /dashboard/workout/new. But If user clicks another date, the page shows selected date previously. If user does not select date in calendar, today should be the value in the page.
```

- 잘되면 commit->merge to main->push to origin 해서 vercel에 deploy되는 지 확인.

### 2. exercise와 set를 workout에 추가하는 기능 구현
약간 복잡한 기능이므로 plan mode로 먼저 확인. (option + t 로 thinking mode도 활성화)

```prompt
create a plan on how to implement logging exercises and sets for a particular workout for the /dashboard/workout/[workoutId] page
```
plan을 검토해서 혹시 필요 없는 부분(샘플 데이타 입력) 같은 것이 있다면 plan을 재검토하는 옵션을 선택해서 적절히 수정하도록 한다.

UI가 마음에 안드는 부분도 있지만 기능은 모두 제대로 됨.

- 확인 후 make new branch -> commit -> merge to main -> push

### 3. Personal vs project custom slash commands

1. mkdir -p ~/.claude/commands && cd ~/.claude/commands
2. code .
3. commit.md 파일 생성후 ```Generate a commit message based on the changes within the current branch. The commit message must be short and to-the-point and provide a summary of the changes. Then commit those changes to the current branch.``` 입력

claude를 재실행 하면 이 명령어를 project level이 아니라 user level에서 어디서나 사용가능.
하지만, 만약 project level과 user level에 같은 명령이 있으면 현재 claude는 user level을 더 우선으로 하게된다. 이런 경우, project command를 내 맘대로 옮길 수는 없으니 ~/.claude/commands/ 아래에 folder를 하나 더 만들어서 거기에 md 파일을 옮긴다. 그렇게 하면 claude code내에서 command를 치명 두 개가 구분이 되도록 list가 된다.

### 4. Agent Skills

Skill에 대해서는 [Agent Skills]를 읽어보면 되겠지만, 'prompt는 대화를 통해 특정/하나의 task를 수행하기 위한 instruction라고 한다면, Skill은 여러번의 일련의 대화 중에서도 필요에 의해서 중간중간에 load했다가 remove했다가 하는 기능이다.'라는 부분이 핵심이다. 즉 docs아래에 있는 파일이나, 결국은 CLAUDE.md파일에 의해서 올라오는 documentation은 항상 context 메모리에 상주하고 있다. MCP도 md파일과 마찬가지로 context에 MCP list는 상주하게 된다(그래서 github copilot을 사용할 때에 MCP server를 등록하는 개수에 대한 warning이 발생한다). 필요할 때 올려서 사용하는 이런 기능을 'progressive disclosure'라고 문서에 쓰여져 있다.

실습에서는 'Skill Creator'라는 skill을 설치를 해서, skill을 만들게 된다. skill을 설치할 때에는 그 안에 들어 있는 script를 확인해서 보안에 문제가 없는 skill인지를 확인하거나 신뢰하는 skill만 설치해야 한다.

1. (https://skills.sh) 접속해서 'skill-creator'를 찾음
2. 설치 명령어를 복사해서 terminal에서 실행
    - project level로 선택(위 명령 실행을 project root에서 실행하는 것 필요)
    - Symlink아니고 Copy to all agents 선택(project에서 모두다 같은 coding agent를 사용하는 경우나, 나만 사용하도록 설치할 때는 이 option이 더 좋음)
    - 이번 course를 위해서는 'find skills' skill을 필요 없겠지만 추천하니까 같이 설치함.
3. claude 재시작

샘플 skill 생성해보기

```prompt
create a new skill that queries the db for all the workout entries for the past year using the database url connection string in the .env file. plot this data to a bar chart using a python script, where the x axis has the month, and the y axis displays the number of workouts. this chart should be exported as an image.
```

만들어진 skill의 .py 를 확인해서 drop table이 들어가는 등 db에 영향을 주는 명령이 있으면 주의해야 한다.

- /workout-chart 명령어를 내리거나 혹은 ```generate the workout chart``` 라고 prompt를 써본다.
    - python 관련 library 설치가 필요하면 설치를 하면 됨.(pip를 위해 venv나 pyenv 등에 대해서는 생략)
    - workout_chart.png 파일 생성됨을 확인

Section 2.8에서 dummy data 생성을 위해 neon MCP server를 사용했는데, 이런 것들은 skill로 만들어서 사용하는 것이 더 좋을 것이다. 왜냐하면 지금도 neon MCP server는 context에 올라가 있지만 section 2 이후로는 사용을 하지 않기 때문.

### 5. bash command를 claude code에서 실행
불편하거나 필요 없을 경우도 있지만 claude code 내에서 bash command를 실행하는 것이 필요할 때도 있다. / 대신 !를 쓰면 된다. 실행되는 동안에는 claude code의 token을 소비하지는 않지만 실행의 결과(output)은 context에 추가가 된다. 따라서 실행 결과를 claude와의 conversation context에 넣을 필요가 있을 때에는 유용하다.

실행된 code가 예를 들어 !npm run dev 같은 것일 때에는 계속해서 실행이 되고 있을 것이기 때문에 ctrl+b

background로 들어간 task를 볼 때에는 화살표 아래를 눌러도 되고, /tasks를 실행하면 된다.

[clerk ai prompts]: https://clerk.com/docs/nextjs/guides/ai/prompts#how-to-use-these-prompts
[clerk dashboard]: https://dashboard.clerk.com/
[shadcn]: https://ui.shadcn.com/docs/installation
[drizzle neon]: https://orm.drizzle.team/docs/get-started/neon-new
[Neon console]: https://console.neon.tech/app/org-shiny-hall-64197320/projects
[Neon MCP Docs]: https://neon.com/docs/ai/neon-mcp-server
[Agent Skills]: https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview