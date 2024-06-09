const exp = require("express");
const app = exp();
const path = require("path");
const fs = require("fs");

const currentDate = new Date();
const formattedCurrentDate = currentDate.toISOString().split("T")[0];

app.use(exp.static("public"));
app.use(exp.json());

let port = 3000;
let member = JSON.parse(fs.readFileSync("./member.json"));
let trainer = JSON.parse(fs.readFileSync("./trainer.json"));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});
app.get("/allRevenuesOfAllMembers", (req, res) => {
  let totalRevenue = 0;
  member.map((mem) => {
    totalRevenue += mem.Membership.cost;
  });
  res.status(200).send(`Total Revenue of all members is ${totalRevenue}`);
});
app.get("/revenuesOfSpecificTrainer/:id", (req, res) => {
  let totalRevenue = 0;
  member.map((mem) => {
    if (mem.TrainerId == req.params.id) {
      totalRevenue += mem.Membership.cost;
    }
  });
  res.status(200).send(`Total Revenue of all members is ${totalRevenue}`);
});
app.get("/member", (req, res) => {
  let data = member.map((mem) => {
    const train = trainer.find((trn) => trn.Id == mem.TrainerId);
    return {
      mem,
      trainer: train,
    };
  });
  res.status(200).send(data);
});
app.get("/member/:id", (req, res) => {
  data = member.find((mem) => {
    return mem.Id == req.params.id;
  });
  console.log(JSON.stringify(data));
  if (data.Membership.to < formattedCurrentDate) {
    res.status(400).send("Member is not active");
  } else {
    res.status(200).json(data);
  }
});
app.post("/member", (req, res) => {
  trueFalseCondition = member.find(
    (mem) => mem.NationalId == req.body.NationalId
  );
  if (trueFalseCondition) {
    res.status(400).send("Member is already exist");
  } else {
    req.body.Id = member.length + 1;
    member.push(req.body);
    fs.writeFileSync("./member.json", JSON.stringify(member));
    res.status(200).send(req.body);
  }
});
app.delete("/member/:id", (req, res) => {
  let id = member.findIndex((mem) => {
    return mem.Id == req.params.id;
  });
  if (id == -1) {
    res.status(404).send("this member not found");
  } else {
    member.splice(id, 1);
    fs.writeFileSync("./member.json", JSON.stringify(member));
    res.status(204).send("this member deleted");
  }
});
app.put("/member/:id", (req, res) => {
  let id = member.findIndex((mem) => {
    return mem.Id == req.params.id;
  });
  if (id == -1) {
    res.status(404).send("this member not found");
  } else {
    member[id].Name = req.body.Name;
    member[id].Membership = req.body.Membership;
    member[id].TrainerId = req.body.TrainerId;
    fs.writeFileSync("./member.json", JSON.stringify(member));
    res.status(203).json(member[id]);
  }
});
app.get("/trainer", (req, res) => {
  let data = trainer.map((trn) => {
    const mem = member.filter((mem) => {
      return mem.TrainerId == trn.Id;
    });
    return {
      trainer: trn,
      member: mem,
    };
  });
  res.status(200).send(data);
});
app.get("/trainer/:id", (req, res) => {
  const trainers = trainer.find((trn) => trn.Id == req.params.id);
  const associatedMembers = member.filter(
    (mem) => mem.TrainerId == req.params.id
  );
  const data = {
    trainer: trainers,
    member: associatedMembers,
  };
  res.status(200).send(data);
});
app.post("/trainer", (req, res) => {
  req.body.id = trainer.length + 1;
  trainer.push(req.body);
  fs.writeFileSync("./trainer.json", JSON.stringify(trainer));
  res.status(200).send(req.body);
});
app.delete("/trainer/:id", (req, res) => {
  let id = trainer.findIndex((trn) => {
    return trn.Id == req.params.id;
  });
  if (id == -1) {
    res.status(404).send("this trainer not found");
  } else {
    trainer.splice(id, 1);
    fs.writeFileSync("./trainer.json", JSON.stringify(trainer));
    res.status(204).send("this trainer deleted");
  }
});
app.put("/trainer/:id", (req, res) => {
  let id = trainer.findIndex((trn) => {
    return trn.Id == req.params.id;
  });
  if (id == -1) {
    res.status(404).send("this trainer not found");
  } else {
    trainer[id].Name = req.body.Name;
    trainer[id].Duration = req.body.Duration;
    fs.writeFileSync("./trainer.json", JSON.stringify(trainer));
    res.status(203).json(trainer[id]);
  }
});
app.use("*", (req, res) => {
  res.send("not found");
});
app.listen(port, () => {
  console.log("port ${port} is ranning");
});
