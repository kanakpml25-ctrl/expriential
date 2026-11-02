"""
Online Quiz Management System  -  Python logic + web server (single file)
-------------------------------------------------------------------------
Course : Python Programming Language (N-PCCCM304P)
Student: Kanak Patni (USN: CM25084)

This ONE Python file contains the whole logic of the project (classes, evaluation,
grading, reports, JSON storage, login with hashed passwords) and a small web server
that gives it to the frontend (index.html, which must be in the same folder).
Only the Python standard library is needed (NumPy/Pandas are used for reports if installed).

Run  :  python quiz_server.py          then open  http://localhost:8000
Admin:  admin / admin123
"""
import csv, hashlib, io, json, os, re, secrets, statistics, sys, threading, webbrowser
from datetime import datetime
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlparse, parse_qs

try:                                    # optional: used for reports when available
    import numpy as np
    import pandas as pd
except ImportError:
    np = pd = None

BASE = os.path.dirname(os.path.abspath(__file__))
DATA_FILE = os.path.join(BASE, "quiz_data.json")
OPTION_LABELS = ("A", "B", "C", "D")
GRADE_SCALE = ((90, "A+"), (80, "A"), (70, "B"), (60, "C"), (40, "D"), (0, "F"))
PASS_PERCENT = 40
LOCK = threading.Lock()


# ----------------------------------------------------------- core logic
def hash_password(p):
    return hashlib.sha256(p.encode("utf-8")).hexdigest()


def get_grade(percent):
    for limit, g in GRADE_SCALE:
        if percent >= limit:
            return g
    return "F"


class Question:
    def __init__(self, text, options, answer, marks=1):
        self.text, self.options, self.answer, self.marks = text, options, answer, marks

    def is_correct(self, choice):
        return choice == self.answer

    def to_dict(self):
        return {"text": self.text, "options": self.options, "answer": self.answer, "marks": self.marks}

    @staticmethod
    def from_dict(d):
        return Question(d["text"], d["options"], d["answer"], d.get("marks", 1))


class Quiz:
    def __init__(self, quiz_id, title, subject, questions=None, negative_marks=0.0):
        self.quiz_id, self.title, self.subject = quiz_id, title, subject
        self.questions = questions if questions is not None else []
        self.negative_marks = negative_marks

    def total_marks(self):
        return sum(q.marks for q in self.questions)

    def to_dict(self, hide_answers=False):
        qs = [q.to_dict() for q in self.questions]
        if hide_answers:
            for q in qs:
                q.pop("answer")
        return {"quiz_id": self.quiz_id, "title": self.title, "subject": self.subject,
                "negative_marks": self.negative_marks, "total_marks": self.total_marks(), "questions": qs}

    @staticmethod
    def from_dict(d):
        return Quiz(d["quiz_id"], d["title"], d["subject"],
                    [Question.from_dict(q) for q in d["questions"]], d.get("negative_marks", 0.0))


def evaluate(quiz, answers):
    """answers: {question_index: chosen_index or None} -> (score, correct, wrong, skipped)"""
    score, correct, wrong, skipped = 0.0, 0, 0, 0
    for i, q in enumerate(quiz.questions):
        choice = answers.get(i)
        if choice is None:
            skipped += 1
        elif q.is_correct(choice):
            score += q.marks
            correct += 1
        else:
            score -= quiz.negative_marks
            wrong += 1
    return max(score, 0.0), correct, wrong, skipped


class Database:
    """users, quizzes and results kept in quiz_data.json (same format as the console project)."""

    def __init__(self, path=DATA_FILE):
        self.path, self.users, self.quizzes, self.results = path, {}, {}, []
        if os.path.exists(path):
            try:
                with open(path, encoding="utf-8") as f:
                    d = json.load(f)
                self.users = d.get("users", {})
                self.quizzes = {q["quiz_id"]: Quiz.from_dict(q) for q in d.get("quizzes", [])}
                self.results = d.get("results", [])
                return
            except (json.JSONDecodeError, KeyError):
                print("Data file damaged - starting fresh.")
        self.seed()

    def save(self):
        with open(self.path, "w", encoding="utf-8") as f:
            json.dump({"users": self.users, "quizzes": [q.to_dict() for q in self.quizzes.values()],
                       "results": self.results}, f, indent=2)

    def seed(self):
        self.users = {"admin": {"password": hash_password("admin123"), "role": "admin", "name": "Administrator"}}
        q = Quiz(1, "Python Basics", "Python", negative_marks=0.25)
        q.questions = [
            Question("Which keyword is used to define a function in Python?", ["func", "def", "define", "function"], 1),
            Question("Which data type is immutable?", ["list", "dict", "tuple", "set"], 2),
            Question("What is the output of len('Quiz')?", ["3", "4", "5", "Error"], 1),
            Question("Which library is used for DataFrames?", ["NumPy", "Pandas", "Math", "Random"], 1),
            Question("Which mode opens a file for writing?", ["'r'", "'a'", "'w'", "'x+'"], 2)]
        self.quizzes = {1: q}
        self.results = []
        self.save()

    def next_id(self):
        return max(self.quizzes, default=0) + 1


DB = Database()
SESSIONS = {}       # token -> username


class ApiError(Exception):
    def __init__(self, msg, code=400):
        super().__init__(msg)
        self.msg, self.code = msg, code


def need(cond, msg, code=400):
    if not cond:
        raise ApiError(msg, code)


# ----------------------------------------------------------- reports (NumPy / Pandas when available)
def r2(x):
    return round(float(x), 2)


def summary():
    rows = {}
    for r in DB.results:
        rows.setdefault(r["quiz_title"], []).append(r["percent"])
    out = []
    for title, p in rows.items():
        if pd is not None:
            s = pd.Series(p)
            std = 0.0 if len(p) < 2 else s.std()
            med, pas = np.median(p), np.mean(np.array(p) >= PASS_PERCENT) * 100
            avg, hi, lo = s.mean(), s.max(), s.min()
        else:
            std = statistics.stdev(p) if len(p) > 1 else 0.0
            med, pas = statistics.median(p), sum(x >= PASS_PERCENT for x in p) / len(p) * 100
            avg, hi, lo = statistics.mean(p), max(p), min(p)
        out.append({"quiz": title, "attempts": len(p), "average": r2(avg), "highest": r2(hi),
                    "lowest": r2(lo), "std": r2(std), "median": r2(med), "pass": r2(pas)})
    allp = [r["percent"] for r in DB.results]
    return {"rows": out, "attempts": len(allp), "students": len({r["username"] for r in DB.results}),
            "overall": r2(statistics.mean(allp)) if allp else 0}


def leaderboard(quiz_id, top=10):
    best = {}
    for r in DB.results:
        if r["quiz_id"] == quiz_id:
            b = best.get(r["username"])
            if b is None or (r["percent"], -r["time_taken"]) > (b["percent"], -b["time_taken"]):
                best[r["username"]] = r
    ranked = sorted(best.values(), key=lambda r: (-r["percent"], r["time_taken"]))
    return ranked[:top]


def csv_text():
    keys = ["username", "quiz_id", "quiz_title", "score", "total", "percent", "grade",
            "correct", "wrong", "skipped", "time_taken", "date"]
    buf = io.StringIO()
    w = csv.DictWriter(buf, fieldnames=keys, extrasaction="ignore")
    w.writeheader()
    w.writerows(DB.results)
    return buf.getvalue()


# ----------------------------------------------------------- API actions
def get_quiz(qid):
    q = DB.quizzes.get(qid)
    need(q, "Quiz not found.", 404)
    return q


def check_question(b):
    text = str(b.get("text", "")).strip()
    opts = [str(o).strip() for o in b.get("options", [])]
    need(text and len(opts) == 4 and all(opts), "Enter the question and all four options.")
    ans = b.get("answer")
    need(isinstance(ans, int) and 0 <= ans <= 3, "Choose the correct option.")
    marks = b.get("marks", 1)
    need(isinstance(marks, int) and 1 <= marks <= 10, "Marks must be between 1 and 10.")
    return Question(text, opts, ans, marks)


def handle(method, path, query, body, user):
    """Returns (data) for an API call. user = (username, record) or None."""
    parts = [p for p in path.split("/") if p][1:]          # drop 'api'
    admin = bool(user and user[1]["role"] == "admin")
    me = user[0] if user else None
    n = len(parts)

    if (method, parts) == ("POST", ["register"]):
        u = str(body.get("username", "")).strip().lower()
        name, pw = str(body.get("name", "")).strip(), str(body.get("password", ""))
        need(re.fullmatch(r"[a-z0-9_]{3,}", u), "Username: at least 3 letters, digits or underscore.")
        need(u not in DB.users, "Username already exists.")
        need(name, "Please enter your full name.")
        need(len(pw) >= 4, "Password must have at least 4 characters.")
        DB.users[u] = {"password": hash_password(pw), "role": "student", "name": name.title()}
        DB.save()
        return {"ok": True}
    if (method, parts) == ("POST", ["login"]):
        u = str(body.get("username", "")).strip().lower()
        rec = DB.users.get(u)
        need(rec and rec["password"] == hash_password(str(body.get("password", ""))), "Invalid username or password.", 401)
        tok = secrets.token_hex(16)
        SESSIONS[tok] = u
        return {"token": tok, "username": u, "name": rec["name"], "role": rec["role"]}
    need(user, "Please log in first.", 401)

    if (method, parts) == ("GET", ["quizzes"]):
        return [{**q.to_dict(hide_answers=not admin), "questions": q.to_dict(hide_answers=not admin)["questions"] if admin else [],
                 "count": len(q.questions)} for q in DB.quizzes.values()]
    if method == "GET" and n == 2 and parts[0] == "quiz":
        return get_quiz(int(parts[1])).to_dict(hide_answers=not admin)
    if (method, parts) == ("GET", ["my-results"]):
        return [r for r in DB.results if r["username"] == me]
    if method == "POST" and n == 3 and parts[0] == "quiz" and parts[2] == "submit":
        q = get_quiz(int(parts[1]))
        need(q.questions, "This quiz has no questions yet.")
        raw = body.get("answers", {})
        answers = {int(k): (v if isinstance(v, int) and 0 <= v <= 3 else None) for k, v in raw.items()}
        score, c, w, s = evaluate(q, answers)
        total = q.total_marks()
        pc = round(score / total * 100, 2) if total else 0.0
        rec = {"username": me, "quiz_id": q.quiz_id, "quiz_title": q.title, "score": score, "total": total,
               "percent": pc, "grade": get_grade(pc), "correct": c, "wrong": w, "skipped": s,
               "time_taken": round(float(body.get("time_taken", 0)), 1), "date": datetime.now().strftime("%Y-%m-%d %H:%M")}
        DB.results.append(rec)
        DB.save()
        rec = dict(rec, passed=pc >= PASS_PERCENT, wrong_answers=[
            {"q": i + 1, "correct": f"{OPTION_LABELS[x.answer]}) {x.options[x.answer]}"}
            for i, x in enumerate(q.questions) if answers.get(i) is not None and not x.is_correct(answers[i])])
        return rec

    need(admin, "Admin access only.", 403)                 # ---- everything below is admin only
    if (method, parts) == ("POST", ["quiz"]):
        title = str(body.get("title", "")).strip()
        need(title, "Quiz title is required.")
        neg = body.get("negative_marks", 0)
        need(isinstance(neg, (int, float)) and neg >= 0, "Negative marks must be 0 or more.")
        q = Quiz(DB.next_id(), title, str(body.get("subject", "")).strip().title() or "General", negative_marks=neg)
        DB.quizzes[q.quiz_id] = q
        DB.save()
        return {"quiz_id": q.quiz_id}
    if method == "DELETE" and n == 2 and parts[0] == "quiz":
        get_quiz(int(parts[1]))
        del DB.quizzes[int(parts[1])]
        DB.save()
        return {"ok": True}
    if method == "POST" and n == 3 and parts[0] == "quiz" and parts[2] == "question":
        get_quiz(int(parts[1])).questions.append(check_question(body))
        DB.save()
        return {"ok": True}
    if method in ("PUT", "DELETE") and n == 4 and parts[0] == "quiz" and parts[2] == "question":
        q, i = get_quiz(int(parts[1])), int(parts[3])
        need(0 <= i < len(q.questions), "Question not found.", 404)
        if method == "PUT":
            q.questions[i] = check_question(body)
        else:
            q.questions.pop(i)
        DB.save()
        return {"ok": True}
    if (method, parts) == ("GET", ["students"]):
        cnt = {}
        for r in DB.results:
            cnt[r["username"]] = cnt.get(r["username"], 0) + 1
        return [{"username": u, "name": d["name"], "attempts": cnt.get(u, 0)}
                for u, d in sorted(DB.users.items()) if d["role"] == "student"]
    if (method, parts) == ("GET", ["reports", "summary"]):
        return summary()
    if (method, parts) == ("GET", ["reports", "leaderboard"]):
        return leaderboard(int(query.get("quiz_id", ["0"])[0]))
    if (method, parts) == ("GET", ["reports", "student"]):
        u = query.get("username", [""])[0].strip().lower()
        return [r for r in DB.results if r["username"] == u]
    if (method, parts) == ("GET", ["reports", "export"]):
        return {"csv": csv_text()}
    raise ApiError("Not found.", 404)


# ----------------------------------------------------------- web server
class Handler(BaseHTTPRequestHandler):
    def log_message(self, *a):
        pass

    def reply(self, code, payload, ctype="application/json"):
        data = payload if isinstance(payload, bytes) else json.dumps(payload).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", ctype + "; charset=utf-8")
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def serve(self, method):
        url = urlparse(self.path)
        if method == "GET" and not url.path.startswith("/api"):
            page = os.path.join(BASE, "index.html")
            if os.path.exists(page):
                with open(page, "rb") as f:
                    return self.reply(200, f.read(), "text/html")
            return self.reply(404, b"index.html not found next to quiz_server.py", "text/plain")
        try:
            n = int(self.headers.get("Content-Length") or 0)
            body = json.loads(self.rfile.read(n) or b"{}") if n else {}
            tok = (self.headers.get("Authorization") or "").replace("Bearer ", "")
            u = SESSIONS.get(tok)
            user = (u, DB.users[u]) if u in DB.users else None
            with LOCK:
                self.reply(200, handle(method, url.path, parse_qs(url.query), body, user))
        except ApiError as e:
            self.reply(e.code, {"error": e.msg})
        except (ValueError, KeyError, TypeError):
            self.reply(400, {"error": "Invalid request."})

    def do_GET(self): self.serve("GET")
    def do_POST(self): self.serve("POST")
    def do_PUT(self): self.serve("PUT")
    def do_DELETE(self): self.serve("DELETE")


def main(port=8000):
    server = ThreadingHTTPServer(("127.0.0.1", port), Handler)
    url = f"http://localhost:{port}"
    print(f"Online Quiz Management System running at {url}   (press Ctrl+C to stop)")
    print("Admin login: admin / admin123")
    try:
        webbrowser.open(url)
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nServer stopped.")


if __name__ == "__main__":
    main(int(sys.argv[1]) if len(sys.argv) > 1 else 8000)
