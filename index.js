const express = require("express");
const app = express();
const cors = require("cors");
app.use(express.json());
app.use(cors());

const mainRoute = `/api/v1/promo`;

const Pool = require("pg").Pool;
const pool = new Pool({
  user: "hnvazkhi",
  host: "satao.db.elephantsql.com",
  database: "hnvazkhi",
  password: "A76qPU4fgpVWt7Mw6YtIxFXWEYwRnC_5",
  port: 5432,
});

const query = async (rawQuery) => {
  return new Promise((res, rej) => {
    pool.query(rawQuery, (err, result) => {
      if (err) rej(err);
      res(result?.rows);
    });
  });
};

app.post(mainRoute, async (req, res, next) => {
  const { id, ...other } = req.body;
  let rawQuery = `INSERT INTO promos`;
  if (Object.keys(other).length > 0) {
    rawQuery += ` (${Object.keys(other).join(", ")}) VALUES (${Object.keys(
      other
    )
      .map((k) => `'${other[k]}'`)
      .join(", ")})`;
  }
  const rows = await query(rawQuery);
  res.status(200).json({
    success: true,
    data: rows[0],
  });
});

app.get(mainRoute, async (req, res, next) => {
  let { _page, _limit, _sort, ...other } = req.query;
  const page = parseInt(_page) || 1;
  const limit = parseInt(_limit) || 10;
  const sort = _sort;

  let rawQuery = "SELECT * FROM promos";
  let countRawQuery = "SELECT COUNT(id) FROM promos";

  if (Object.keys(other).length > 0) {
    let where = [];
    Object.keys(other).map((key) => {
      if (key.includes("_like")) {
        where.push(`${key.split("_")[0]} LIKE '%${other[key]}%'`);
      } else if (key.includes("_in")) {
        let value = [];
        if (typeof other[key] === "string") {
          value = [other[key]];
        } else {
          value = other[key];
        }
        where.push(
          `${key.split("_")[0]} IN (${value.map((x) => `'${x}'`).join(",")})`
        );
      } else {
        where.push(`${key} = '${other[key]}'`);
      }
    });
    if (where.length > 0) {
      rawQuery += " WHERE " + where.join(" AND ");
      countRawQuery += " WHERE " + where.join(" AND ");
    }
  }

  if (sort) {
    rawQuery += ` ORDER BY ${sort}`;
  }
  let rawQueryWithPagination =
    rawQuery + ` LIMIT ${limit} OFFSET ${(page - 1) * limit}`;

  const data = await query(rawQueryWithPagination);
  let [{ count }] = await query(countRawQuery);
  count = parseInt(count);

  res.status(200).json({
    success: true,
    data,
    pagination: {
      current_page: page,
      page_size: limit,
      total_count: count,
      total_page: Math.ceil(count / limit),
    },
  });
});

app.get(mainRoute + "/:id", async (req, res, next) => {
  const rows = await query(`SELECT * FROM promos WHERE id=${req.params.id}`);
  res.status(200).json({
    success: true,
    data: rows[0],
  });
});

app.put(mainRoute + "/:id", async (req, res, next) => {
  const { id, ...other } = req.body;
  let rawQuery = `UPDATE promos`;
  if (Object.keys(other).length > 0) {
    const data = [];
    Object.keys(other).map((key) => {
      data.push(`${key} = '${other[key]}'`);
    });
    if (data.length > 0) {
      rawQuery += ` SET ${data.join(", ")}`;
    }
  }
  await query(`${rawQuery} WHERE id=${req.params.id}`);
  res.status(200).json({
    success: true,
    data: req.body,
  });
});

app.delete(mainRoute + "/:id", async (req, res, next) => {
  await query(`DELETE FROM promos WHERE id=${req.params.id}`);
  res.status(200).json({
    success: true,
    data: req.body,
  });
});

app.listen("3001", () => {
  console.log("Server is listening on port 3001");
});

module.exports = app;
