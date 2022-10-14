const express = require("express");
const router = express.Router();
const { query } = require("../../../db");

router.post("/", async (req, res, next) => {
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

const operatorMapper = (operator) => {
  switch (operator.toLowerCase()) {
    case "eq":
      return "=";
    default:
      return operator.toUpperCase();
  }
};

router.get("/", async (req, res, next) => {
  const { query: reqQueryStr, type } = req.query;
  let reqQuery = {};

  try {
    reqQuery = JSON.parse(reqQueryStr);
  } catch (error) {}

  let { limit, offset, where, order_by } = reqQuery || {};

  if (!limit) limit = 10;
  if (!offset) offset = 0;

  let rawQuery = "SELECT * FROM promos";
  let countRawQuery = "SELECT COUNT(id) FROM promos";

  if (where && where.and) {
    let tmpWhere = [];
    Object.keys(where?.and || {}).map((fieldName) => {
      const oprt = Object.keys(where?.and?.[fieldName])[0];
      let operator = operatorMapper(oprt);
      let value = where?.and?.[fieldName]?.[oprt];
      if (["LIKE", "ILIKE"].includes(operator)) value = `%${value}%`;
      if (operator && value) {
        tmpWhere.push(`${fieldName} ${operator} '${value}'`);
      }
    });
    if (tmpWhere.length > 0) {
      rawQuery += " WHERE " + tmpWhere.join(" AND ");
      countRawQuery += " WHERE " + tmpWhere.join(" AND ");
    }
  }

  if (order_by && order_by.length > 0) {
    order_by = order_by.filter(
      (ob) =>
        ob.field_name &&
        ob.sort &&
        ["asc", "desc"].includes(ob.sort.toLowerCase())
    );

    rawQuery += ` ORDER BY ${order_by
      .map((x) => `${x?.field_name} ${x?.sort?.toUpperCase()}`)
      .join(", ")}`;
  }
  let rawQueryWithPagination = rawQuery + ` LIMIT ${limit} OFFSET ${offset}`;

  // console.log(rawQueryWithPagination);
  const data = await query(rawQueryWithPagination);
  let [{ count }] = await query(countRawQuery);
  count = parseInt(count);

  res.status(200).json({
    success: true,
    data,
    count,
  });
});

router.get("/:id", async (req, res, next) => {
  const rows = await query(`SELECT * FROM promos WHERE id=${req.params.id}`);
  res.status(200).json({
    success: true,
    data: rows[0],
  });
});

router.put("/:id", async (req, res, next) => {
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

router.delete("/:id", async (req, res, next) => {
  await query(`DELETE FROM promos WHERE id=${req.params.id}`);
  res.status(200).json({
    success: true,
    data: req.body,
  });
});

module.exports = router;
