const express = require('express');
const router = express.Router();
const db = require('../db/index');

router.get('/:code', (req, res) => {
  const { code } = req.params;

  db.query('SELECT * FROM outlets WHERE code = ?', code)
    .then(outlet => {

      if (outlet.length === 0) return res.status(400).send('Activation Code is incorrect, Please try again.');
      if (outlet[0].status === 'In use') return res.status(400).send('Outlet is already in use!');

      const id = outlet[0].id;

      db.query('START TRANSACTION;'
        + ' UPDATE outlets SET status="In use" WHERE id = ?;'
        + ' SELECT o.id, o.code,  o.status, o.power, o.station, c.name, c.img, p.payment, p.unit'
        + ' FROM outlets as o'
        + ' JOIN stations as s ON s.id = o.station'
        + ' JOIN connectors as c ON c.id = o.connector'
        + ' JOIN prices as p ON p.id = o.price'
        + ' WHERE s.id = ?'
        + ' GROUP BY o.id;'
        + ' COMMIT;', [id, id])
        .then(updated => {
          if (updated[2].length === 0) return res.status(400).send('Something went wrong please try again.');
          res.send(updated[2])
        })
        .catch(err => {
          console.log(err)
          res.sendStatus(500)
        });
    })
    .catch(err => res.sendStatus(500));

});

module.exports = router;