const mongoose = require("mongoose");
Schema = mongoose.Schema;


const techboardSchema = new Schema(
                        {
                            companyName: { type : String , index: true },
                            logoLocation: String,
                            pageUrl: String,
                            CompanyAnnouncements: String,
                            ElevatorPitch : String,
                            Category : String,
                            URL : String,
                            OperationalStatus : String,
                            ASXListingCode : String,
                            YearofCommencement : Number,
                            Address : String,
                            State : String,
                            OverseasOperations : String,
                            Twitter : String,
                            Facebook : String,
                            Linkedin : String,
                            KeyPersonnel : String,
                            AwardsWon: String
                        },
                        {
                            collection: 'IndexedTechBoardCollection'
                        }
                );
techboardSchema.index({companyName: 'text'});
const techboardListing = mongoose.model("techboardListing", techboardSchema);

module.exports = techboardListing;