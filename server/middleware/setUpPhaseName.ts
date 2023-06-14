/* eslint-disable no-param-reassign */
import express from 'express'
import config from '../config'

export default (app: express.Express) => {
  app.locals.phaseName = config.phaseName
  app.locals.phaseNameColour = config.phaseName === 'PRE-PRODUCTION' ? 'govuk-tag--green' : ''
}
