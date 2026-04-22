"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HolidayService = void 0;
class HolidayService {
    holidayRepo;
    constructor(holidayRepo) {
        this.holidayRepo = holidayRepo;
    }
    async listHolidays() {
        const snapshot = await this.holidayRepo.getAllHolidays();
        const holidays = snapshot.docs.map((doc) => {
            const data = doc.data();
            return {
                id: doc.id,
                name: data.name,
                imageUrl: data.imageUrl,
                date: data.date,
            };
        });
        return { holidays };
    }
}
exports.HolidayService = HolidayService;
//# sourceMappingURL=holiday.js.map