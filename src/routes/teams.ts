import express from 'express'
import rateLimit from 'express-rate-limit'
import {
  getAllTeams,
  getTeam
} from "../controllers/teamController.js"

const teamRouter = express.Router()

const allTeamsLimiter = rateLimit({
  windowMs: 10 * 1000, // 10 seconds
  max: 4
});

const teamLimiter = rateLimit({
  windowMs: 5 * 1000, // 5 seconds
  max: 10
})

teamRouter.route('/').get(allTeamsLimiter, getAllTeams)
teamRouter.route('/team').get(teamLimiter, getTeam)

export default teamRouter
