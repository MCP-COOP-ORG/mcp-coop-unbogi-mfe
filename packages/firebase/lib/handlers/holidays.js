'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.list = void 0;
const https_1 = require('firebase-functions/v2/https');
const contracts_1 = require('@unbogi/contracts');
const holiday_1 = require('../services/holiday');
const holiday_2 = require('../repositories/holiday');
const holidayRepo = new holiday_2.HolidayRepository();
const holidayService = new holiday_1.HolidayService(holidayRepo);
exports.list = (0, https_1.onCall)({ region: contracts_1.FUNCTION_CONFIG.REGION }, async () => {
  return await holidayService.listHolidays();
});
//# sourceMappingURL=holidays.js.map
