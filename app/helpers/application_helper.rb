module ApplicationHelper

  # Handles formatting of the page title by appending site name to end
  # of a particular page's title.
  # @param page_title [String] the page title from a particular view.
  def title(page_title)
    default = "SMC-Connect"
    if page_title.present?
      content_for :title, "#{page_title.to_str} | #{default}"
    else
      content_for :title, default
    end
  end

  # Since this app includes various parameters in the URL when linking to a
  # location's details page, we can end up with many URLs that display the
  # same content. To gain more control over which URL appears in Google search
  # results, we can use the <link> element with the "rel=canonical" attribute.

  # This helper allows us to set the canonical URL for the details page in the
  # view. See app/views/organizations/show.html.haml
  #
  # More info: https://support.google.com/webmasters/answer/139066
  def canonical(url)
    content_for(:canonical, tag(:link, :rel => :canonical, :href => url)) if url
  end

  # Top level services and their children categories.
  # Displayed on the home page.
  # @return [Array] Array of hashes with parent and children describing titles and list items.
  def service_terms
    [
      {
        :parent => 'government assistance',
        :children => ['calfresh/food stamps','health insurance',
          'wic/women, infants, & children',"sfmnp/food vouchers for seniors",
          'medi-cal','medicare'].sort
      },
      {
        :parent => "children, teens, & families",
        :children => ['mentoring programs','discrimination','counseling',
          'child care','abuse prevention','youth development'].sort
      }
    ]
  end

  # Top level services and their children categories.
  # Displayed on the home page.
  # @return [Array] Array of hashes with parent and children describing titles and list items.
  def emergency_terms
    [
      { :parent => 'emergency',
        :children => ['hotlines','emergency food','emergency shelter','psychiatric emergency'].sort
      },
      { :parent => "reporting",
        :children => ['domestic violence','child abuse'].sort
      }
    ]
  end

  # @return [Hash] Defines which query terms will display an info box
  # on the results page for select keywords.
  def info_box_terms
    {
      'wic' =>
        ['women, infants, and children','WIC/Women, Infants, & Children'],
      'sfmnp' =>
        ["senior farmers' market nutrition program",
          "SFMNP/Food vouchers for seniors"],
      'market match' => [],
      'calfresh' => ['food stamps','snap','calfresh/food stamps'],
      'health care reform' => ['affordable care act','health insurance']
    }
  end

  # @return [Hash] Defines which query terms will display an info box
  # on the results page for select keywords.
  def info_box_terms
    YAML.load(File.read(File.expand_path("#{Rails.root}/config/terminology.yml", __FILE__)))
  end

  # @return [Hash] Returns a hash that should be fed into a `render` command
  # that will corresponds to the info box partial in /app/views/component/terminology,
  # or nil if no search keyword is present.
  def dynamic_partial
    if params[:keyword].present?
      keyword = params[:keyword].downcase
      # Create 2 arrays: one containing the search terms of the info_box_terms,
      # and the other containing all the synonymns of those terms.
      main_terms = info_box_terms.keys
      synonyms = []
      info_box_terms.select { |k,v| synonyms.push(v['synonymns']) }
      synonyms.flatten!

      # Check if the keyword matches any of the terms or synonymns.
      if (main_terms + synonyms).include?(keyword)

        # If the keyword matches a value, we find the corresponding key.
        # The key is what the partial name corresponds to.
        if synonyms.include?(keyword)
          partial = info_box_terms.find { |k,v| v['synonymns'].include? keyword }.first
        # Otherwise, it means the keyword matches a key
        else
          partial = keyword
        end

        # Grab the specific term details for filling a template partial.
        term = info_box_terms[partial]

        # Replace spaces in the key string with underscores to match
        # the partial name (see app/views/components/terminology),
        # and return the path to the partial for use in the view.
        dynamic_partial = partial.tr(' ','_')

        # Specify the path to the partial.
        partial_path = 'component/terminology'

        # If a partial with the specified name does not exist and the term
        # contains a title, description, and link in the yaml file, use the
        # template partial.
        if !File.exist?("#{Rails.root.join('app','views',partial_path,'_'+dynamic_partial+'.html.haml')}")
          dynamic_partial = 'template'
        end

        {:partial => "#{partial_path}/#{dynamic_partial}", :locals => {:term=>term}}
      end
    end
  end

  # Keyword search autocomplete data
  # @return [Array] List of CIP keywords.
  def cip_keywords
    ["211","911 Services","ADA Implementation Assistance","ADMINISTRATION AND PLANNING SERVICES","ADULT PROTECTION AND CARE SERVICES","AIDS/HIV Issues","AIDS/HIV/STD Prevention Kits","ALCOHOLISM SERVICES","Abortion Information","Abortion Issues","Abortion Services","Abortions","Abuse Counseling","Accessibility Information","Active Military","Acupuncture","Acute or Sub-acute Treatment","Addiction/Dependencies Issues","Addictions/Dependencies Support Groups","Administration and Planning","Administrative Entities","Adolescent Medicine","Adolescent/Youth Counseling","Adolescents","Adoption","Adoption Services","Adoptive Parent/Child Search","Adult","Adult Child Abuse Survivors","Adult Day Care","Adult Day Health Care","Adult Day Health Programs","Adult Day Programs","Adult Residential Care Homes","Adult Residential Treatment Facilities","Adult/Child Mentoring Programs","Adults","Adults With Disabilities","Advisory Boards","Advocacy","African American Community","Agricultural Pest/Disease Control Assistance","Agricultural Pollution Prevention/Mitigation Assistance","Airports","Alcohol Abuse Issues","Alcohol Dependency Support Groups","Alcohol Detoxification","Alcohol/Drug Impaired Driving Prevention","Alcoholism Counseling","Alternative","Alternative ","Alternative Health Care","Alzheimer's Disease","Amateur Athletic Associations","Anger Management","Animal Adoption","Animal Rescue","Animal Services","Animal/Pet Issues","Anxiety Disorders","Aquatic Therapy","Architects","Art Galleries/Exhibits","Art Therapy","Artist Services","Arts Centers","Arts and Crafts","Arts and Culture","Asian Community","Assistive/Medical Aids","At Risk Populations","Attendant Registries","Attention Deficit/Hyperactivity Disorder","Autism","Automobile Loans","Auxiliaries","Ballet Performances","Bankruptcy Courts","Bathing Facilities","Beer/Liquor Licenses and Permits","Bereavement Counseling","Bereavement Support Groups","Better Business Bureaus","Birth Certificates","Birth Control","Blindness","Blood Banks","Blood and Tissue Banks","Boards of Education","Bone Marrow Donation Registries","Book Distribution Programs","Boxing","Boys","Boys/Girls Clubs","Brain Injury Rehabilitation","Breast Cancer","Breastfeeding","Brown Bag Food Programs","Building Code Enforcement/Appeals","Building Inspection","Business Assistance Volunteer Opportunities","Business Associations","Business Consulting Services","CFIDS","CHILD PROTECTION AND CARE SERVICES","COMMODITY SERVICES","COMMUNITY SERVICES","CalFresh","Camperships","Camping","Camps","Career Counseling","Career Development","Case Management","Case/Care Management","Cash Assistance Program for Immigrants","Centers for Independent Living","Certificates/Forms Assistanc","Certificates/Forms Assistance","Chambers of Commerce","Charities/Foundations/Funding Organizations","Child Abuse Hotlines","Child Abuse Issues","Child Care Centers","Child Care Issues","Child Care Provider Licensing","Child Care Provider Referrals","Child Care Providers","Child Care Subsidies","Child Guidance","Child Support Assistance/Enforcement","Children","Children and Youth with Disabilities","Children and Youth with Emotional Disturbance","Children's Clothing","Children's Protective Services","Children's State/Local Health Insurance Programs","Children's/Adolescent Residential Treatment Facilities","Chinese Community","Citizenship Assistance Centers","Citizenship Education","Citizenship and Immigration Services Offices","City/County Parks","City/County Planning Offices","Civic Groups","Civil Service Employees","Civil State Trial Courts","Clergy/Faith Community Personnel","Clothing","Clothing Vouchers","Clothing/Personal Items","Clutterers/Hoarders","Cognitive Behavioral Therapy","Commemorative Events","Commissions, Councils, or Boards","Communicable Disease Control","Community Action/Social Advocacy Groups","Community Adult Schools","Community Clinics","Community Colleges","Community Development Issues","Community Facilities/Centers","Community Improvement","Community Information","Community Planning and Public Works","Companion","Comprehensive Disability Related Employment Programs","Comprehensive Information and Referral","Comprehensive Outpatient Alcoholism Treatment","Comprehensive Outpatient Drug Abuse Treatment","Comprehensive Outpatient Substance Abuse Treatment","Computer User Groups","Computer and Related Technology Classes","Conference/Convention Facilities","Conflict Resolution Training","Congregate Meals/Nutrition Sites","Conjoint Counseling","Conservation","Consumer Assistance","Consumer Complaints","Consumer Law","Consumer Protection Agencies","Consumer Safety Standards","Contraceptive Assistance","Convalescent Care","Counseling Settings","County Correctional Facilities","County Counsel","County Elections Director Offices","County Executive Offices","County Recorder Offices","County Treasurer Offices","Court Ordered Individuals","Courts","Credit Counseling","Crime Prevention","Crime Victim Accompaniment Services","Crime Victim Support","Crisis Intervention","Crisis Intervention/Hotlines","Crisis Shelter","Crisis/Abuse Intervention/Hot","Crohn's Disease","Cultural Heritage Groups","Cultural Transition Facilitation","Cultural/Racial Issues","DEVELOPMENTAL DISABILITIES SERVICES","DRUG ABUSE SERVICES","DUI Offender Programs","Dance Instruction","Dance Performances","Day Camps","Day Care","Day Labor","Day Treatment","Day Treatment for Adults with Developmental Disabilities","Deafness","Death Related Records/Permits","Death and Dying Issues","Defense Representation","Dementia Management","Dental","Dental Care","Dental Care Referrals","Detoxification","Developmental Assessment","Developmental Disabilities","Developmental Disabilities Activity Centers","Developmental Disabilities Day Habilitation Programs","Diabetes","Diabetes Management Clinics","Disabilities Issues","Disability Related Counseling","Disability Related Sports","Disaster Management Organizations","Disaster Preparedness","Disaster Relief","Disease/Disabilities Information","Disease/Disability Information","District Attorney","Diversion","Diversion Programs","Division","Divorce Counseling","Domestic Violence Hotlines","Domestic Violence Issues","Domestic Violence Shelters","Driver Licenses","Driving While Intoxicated","Drop-in Services","Drug Abuse Counseling","Drug Dependency Support Groups","Drug Detoxification","Drug Diversion","Drug-Free Treatment","Dwarfism","EDUCATION SERVICES","EMERGENCY SERVICES","EMPLOYMENT/TRAINING SERVICES","Early Childhood Education","Early Head Start","Early Intervention for Children with Disabilities/Delays","Eating Disorders Treatment","Education","Education/Child Care/Recreation","Education/Information","Elder Abuse Issues","Election Information","Emergency Communications","Emergency Food","Emergency Medical Care","Emergency Room Care","Emergency Shelter","Emergency Shelter Clearinghouses","Employee Fraud Reporting","Employment","Employment Discrimination Assistance","English Language","English as a Second Language","Environment Volunteer Opportunities","Environmental Hazards Information","Environmental Improvement Groups","Environmental Issues","Environmental Protection and Improvement","Equestrian Therapy","Errand Running/Shopping Assistance","Escort","Ex-Offender Reentry Programs","Ex-Offenders","Expectant/New Parent Assistance","Extended Day Care","Eye Care","Eye Examinations","Eye Screening","FAMILY PLANNING SERVICES","FINANCIAL ASSISTANCE SERVICES","Facilities/Community Centers","Families","Families/Friends of Alcoholics Support Groups","Families/Friends of Drug Abusers Support Groups","Families/Friends of GLBT Individuals","Family Counseling","Family Housing/Shared Housing","Family Law","Family Law Courts","Family Planning","Family Support","Family Violence Issues","Farmers Markets","Fathers","Fear of Flying","Federal Government Complaints/Ombudsman Offices","Federated Giving Programs","Feral Cat Management Programs","Field Trips/Travel","Financial Assistance","First Aid Instruction","First Offender DUI Programs","First Time Buyer Home Loans","Flood/Siltation Control","Food","Food Banks/Food Distribution Warehouses","Food Boxes/Food Vouchers","Food Lines","Food Pantries","Food Served/Soup Kitchens","Food Sorting/Packing Volunteer Opportunities","Food Stamps","SNAP","Foster Grandparent Program","Foster Homes for Dependent Children","Foster Parent/Family Recruitment","Fraternal Orders","Friendly Telephoning","Fund Raising","Funding","Furniture","Furniture/Appliances","GED Instruction","Garden Tours","Gay, Lesbian, Bisexual, Transgender Individuals","Gay/Lesbian/Bisexual/Transgender Community Centers","Gay/Lesbian/Bisexual/Transgender Individuals","Gay/Lesbian/Bisexual/Transgender Issues","Genealogical Societies","General Counseling Services","General Legal Aid","General Relief","General Support","Genetic Disease Guidance","Geriatric Counseling","Girls","Glasses/Contact Lenses","Grocery Delivery","Group Counseling","Group Residences for Adults with Disabilities","Group Support","Group/Independent Living","Growth and Adjustment","Guardians ad Litem Volunteer Opportunities","Guardianship/Conservatorship","HANDICAP SERVICES","HEALTH SERVICES","HIV Testing","HOUSING SERVICES","Harbors/Marinas","Hazardous Materials Collection Sites","Head Start","Health","Health Care Referrals","Health Education","Health Facility Complaints","Health Facility Licensing","Health Insurance Information/Counseling","Health Issues","Health Related Temporary Housing","Health Screening/Diagnostic Services","Hearing Impairments","Hearing Loss","Heart Disease","Helplines/Warmlines","Hepatitis","High School Completion/GED","High School Districts","Hispanic/Latino Community","Historic House Museums","Historic Preservation","Historical Societies","Holiday Programs","Home Barrier Evaluation/Removal Services","Home Delivered Meals","Home Health Care","Home Improvement/Accessibility","Home Maintenance and Minor Repair Services","Home Nursing","Home Rehabilitation Loans","Home Rehabilitation Programs","Home Schooling","Homebuyer/Home Purchase Counseling","Homeless Families","Homeless Motel Vouchers","Homeless People","Homeless Shelter","Homelessness Issues","Homeowner Associations","Homework Help Programs","Horticultural Societies","Hospice","Hospice Care","Hospitals","Hostels","Housing","Housing Authorities","Housing Counseling","Housing Discrimination Assistance","Housing Expense Assistance","Housing Issues","Human Resources Personnel","Human Rights Groups","Human Rights Issues","Human Rights/Ombudsman/Advocacy","Human/Social Services Issues","INDIVIDUAL AND FAMILY DEVELOPMENT SERVICES","Identification Cards","Immigration Issues","Immigration/Naturalization","Immigration/Naturalization Legal Services","In Home Assistance","In Home Supportive Services Subsidies","In-Home Supportive","Independent Living Skills Instruction","Individual Counseling","Individual/Group Counseling","Infants/Toddlers","Infertility Diagnosis/Treatment","Information","Information Services","Information and Referral","Inmate Support","Inmate Support Services","Inmate/Ex-Offender","Inmates","Inpatient Alcoholism Treatment Facilities","Inpatient Care","Inpatient Drug Abuse Treatment Facilities","Inpatient Health Facilities","Inpatient Mental Health Facilities","Inpatient Substance Abuse Treatment Facilities","Instructional Materials","Instructional Materials Centers","Intellectual Disabilities","International Human Rights Programs","International Issues","Interpretation/Translation","Investigation/Intervention","Investment Counseling","Jewish Community","Job Counseling/Testing","Job Development","Job Finding Assistance","Job Information","Job Information/Placement/Referral","Job Interview Training","Job Search Techniques","Job Search/Placement","Job Training","Job Training Formats","Juvenile Courts","Juvenile Delinquency Prevent","Juvenile Delinquency Prevention","Juvenile Delinquents","Juvenile Deliquency Prevention","Juvenile Detention Facilities","Kidney Disease","Kinship Caregivers","LEGAL AND CRIMINAL JUSTICE SERVICES","Labor Organizations","Land Conservation","Land Deeds/Titles","Land Records","Landlord/Tenant","Landlord/Tenant Assistance","Landscape Architects","Language Interpretation","Laundry Facilities","Laundry Vouchers","Law Enforcement","Law Enforcement Records/Files","Law Libraries","Lawyer Referral Services","Lead Information","Learning Disabilities","Legal Assistance Modalities","Legal Associations","Legal Counseling","Legal Issues","Legal Representation","Libraries","Library","Literacy","Literacy Programs","Local Bus Services","Long Term Care Ombudsman Programs","Low Cost Meals","Low Income","Low Income/Subsidized Private Rental Housing","Low Income/Subsidized Rental Housing","MENTAL HEALTH SERVICES","Machado-Joseph Disease","Magic Shows","Maintenance","Management Assistance","Marine Conservation","Marine Mammal Protection","Marine Science/Oceanography Clubs/Societies","Marriage Counseling","Marriage and Family Therapist Associations","Material Resources","Maternity Homes","Mayors Office","Mayors Offices","Meal Sites/Home-delivered Mea","Meal Sites/Home-delivered Meal","Meal Sites/Home-delivered Meals","Mediation","Medicaid","Medical Appointments Transportation","Medical Assistance","Medical Associations","Medical Libraries","Medical Public Assistance Programs","Medicare","Medicare Appeals/Complaints","Medicare Enrollment","Meditation","Meeting Space","Men","Mental Health Evaluation","Mental Health Halfway Houses","Mental Health Issues","Mental Health Support Services","Mental Illness/Emotional Disabilities","Mentoring Programs","Mentoring Services Volunteer Opportunities","Metting Space","Migrant Education Programs","Mobile Dental Care","Mobility Aids","Money Management","Mortgage Delinquency and Default Resolution Counseling","Mortuary Services","Mother and Infant Care","Mother/Infant Care","Motor Vehicle Registration","Multiple Birth Children","Multiple Offender DUI Programs","Multiple Sclerosis","Multipurpose Performing Arts Centers","Museums","Music Composers","Music Groups","Music Instruction","Music Performances","Music Recitals","Native American Community","Neighborhood Improvement Groups","Networking/Relationship Building Support","Newborns","Nonprofit/Philanthropic Associations","Nonpublic Special Schools","Nutrition","Nutrition Assessment Services","Nutrition Education","ORGANIZATIONAL SUPPORT SERVICES","Observation/Diagnosis","Occupational","Occupational Health and Safety","Occupational Therapy","Occupational/Professional Associations","Older Adult Social Clubs","Older Adult Volunteers","Older Adult/Aging Issues","Older Adult/Disability Related Supportive Housing","Older Adults","On the Job Training","Open Adoption","Opera Performances","Optometric","Organic Gardening Societies","Out-Of-Home Care","Out-Of-Home Care Placement","Out-of-Home Care","Out-of-Home Care Placement","Outdoor Environmental Education","Outpatient Care","Outpatient Health Facilities","Outpatient Mental Health Facilities","Outreach Programs","Overeating/Food Addiction","Own Recognizance","Palliative Care","Para-Transit","Paratransit Programs","Parent Counseling","Parent Groups","Parent/Family Involvement in Education","Parental Visitation Monitoring","Parenting Education","Parents","Parks/Playground","Parks/Recreation Areas","Parole","Pastoral Counseling","Pathologists","Patriotic Societies","Patriotic Socities","Pediatric Dentistry","Pediatrics","Peer Counseling","People With Disabilities","Performing Arts/Film Personnel","Personal Emergency Response Systems","Physical Activity and Fitness Education/Promotion","Physical Disabilities","Physical Medicine and Rehabilitation","Physical Therapy","Planning Commissions","Planning/Coordinating/Advisory Groups","Planning/Coordintaing/Advisory Groups","Play Therapy","Police/Law Enforcement","Political Associations/Clubs","Political Parties","Port Services","Post Mortem Estate Administration","Poverty Level","Pregnancy Counseling","Pregnancy Testing","Pregnant Teens","Pregnant Women","Prejob Guidance","Prenatal Care","Preschool","Preschool Age Children","Preschools","Prevention","Prevention, Care and Research in Specific Diseases","Prison Ministries","Private Schools","Probate Courts","Probation","Property Tax Agencies","Property Tax Assessment Appeals Boards","Property Tax Collection Agencies","Prosecution Representation","Protective Services for Animals","Psychiatric Case Management","Psychiatric Case management","Psychiatric Day Treatment","Psychiatric Emergency","Psychiatric Emergency Room Care","Psychiatric Inpatient Units","Psychiatric Medication Monitoring","Psychiatric Resocialization","Psychologist referrals","Public Charities","Public Health","Public Health Information/Inspection/Remediation","Public Health Inspection","Public Health Nursing","Public Housing","Public Inebriate Transportation","Public Lectures/Discussions","Public Libraries","Public Officials Offices","Public Transit","Public Transit Authorities","Pupil Support/Tutoring","RECREATION/LEISURE SERVICES","Re-Entry/Ex-Offender","Recovering Alcoholics","Recovering Drug Abusers","Recreation/Social Activities","Recreation/Social Activity","Recreational Items","Recreational/Leisure/Arts Instruction","Recycling","Refugee Resettlement Services","Regional Occupational Programs","Rehabilitation","Rehabilitation/Occupational","Rehabilitation/Occupational Therapy","Religious Groups/Communities","Religious Service Projects","Relocation","Rental Deposit Assistance","Repairs","Reproductive Issues","Residential Alcoholism Treatment","Residential Alcoholism Treatment Facilities","Residential Camps","Residential Care","Residential Drug Abuse Treatment","Residential Drug Abuse Treatment Facilities","Residential Substance Abuse Treatment","Residential Treatment Facilities","Resocialization/Social Adjustment","Respite Care","Respite/Emergency Caretaker","Resume Preparation Assistance","Retired Military","Retired People","Retirement Benefits","Roommate/Housemate Matching Assistance","Runaway/Youth Shelters","SSI","SSI Appeals/Complaints","Safer Sex Education","Sailing","Scholarships","School Based Teen Parent/Pregnant Teen Programs","School Clothing","School Enrollment and Curriculum","School Readiness Programs","School Supplies","Scouting Programs","Screening/Diagnosis","Screening/Immunization","Section 8 Housing Choice Vouchers","Self-Help","Senior Centers","Senior Companion Program","Senior Out-Of-Home Care Place","Senior and Disabled Housing","Sensory Integration Therapy","Service Animals","Service Clubs","Sexual Assault Counseling","Sexual Assault Hotlines","Sexual Assault Treatment","Sexually Transmitted Disease Screening","Shelter/Refuge","Sheltered Employment","Sheriff","Sister Cities Programs","Skiing","Skilled Nursing Facilities","Small Business Development","Small Business Development and Assi","Small Business Development and Assistance","Small Business Financing","Small Claims Courts","Smoking Cessation","Soccer","Social Clubs/Events","Social Sciences and Humanities Research","Social Security Burial Benefits","Social Security Disability Benefits","Social Security Disability Insurance Appeals/Complaints","Social Security Retirement Benefits","Social Security Survivors Insurance","Social Services for Military Personnel","Soup Kitchens","Speakers","Speakers/Speakers Bureaus","Special Education","Special Education Classes/Centers","Special Events/Entertainment","Special Interest Clubs","Special Libraries","Special Library Collections","Special Needs Job Development","Special Olympics","Speech Therapy","Speech and Language Evaluations","Speech and Language Pathology","Sports/Games/Exercise","Spouse/Domestic Partner Abuse Counseling","Spouse/Domestic Partner Abuse Prevention","Square Dancing Instruction","Staff Training","State Parks","Storytelling","Stroke","Stroke Rehabilitation","Student Disability Services","Student Financial Aid","Studio Space for Artists","Subsidized","Subsidized Home Purchase","Subsidized Housing Administrative Organizations","Substance Abuse Counseling","Substance Abuse Day Treatment","Substance Abuse Education/Prevention","Substance Abuse Hotlines","Substance Abuse Issues","Substance Abuse Referrals","Substance Abuse Services","Substance Abuse Treatment Programs","Support Groups","Sweat Equity Programs","Swimming/Swimming Lessons","System Advocacy","TANF","TRANSPORTATION SERVICES","Tax Preparation Assistance","Team Sports/Leagues","Technical Assistance","Teen Pregnancy Prevention","Teenage Parents","Telecommunication Relay Services","Telephone Assistance","Telephone Crisis Hotline","Telephone Crisis Intervention","Temporary","Temporary Financial Assistance","Tenant Rights Information/Counseling","Terrorism Preparedness Information","Theater Performances","Thrift Shops","Tongan Community","Tools/Equipment","Tourist Information","Trade Associations","Traffic Courts","Training and Employment Programs","Transitional Housing/Shelter","Transportation","Transportation Expense Assistance","Transportation Issues","Transportation Management Associations","Transportation Passes","Travelers Assistance","Tutoring Services","Ulcerative colitis","Utilities","Utility Assistance","Utility Service Payment Assistance","Veteran Compensation and Pension Benefits","Veteran Outpatient Clinics","Veterans","Victims of Accidents Caused by Impaired Drivers","Vocational","Vocational Assessment","Vocational Rehabilitation","Volunteer Assistance","Volunteer Opportunities","Volunteer Recruitment/Placement","Volunteers","Voter Registration Offices","WIC","Weatherization","Weatherization Programs","Weights and Measures","Welfare Rights Assistance","Widowers","Widows","Wildlife Rescue/Relocation","Women","Women's Health Centers","Work Clothing","Work Clothing Donation Programs","Work Tools/Equipment","Y Facilities","Young Adults","Youth","Youth Agricultural Programs","Youth Business Programs","Youth Citizenship Programs","Youth Development","Youth Employment","Youth Enrichment","Youth Enrichment Programs","Youth Job Development","Zoos/Wildlife Parks"]
  end

  # Location search autocomplete data (all cities of SMC)
  # @return [Array] List of cities in SMC.
  def smc_cities
    ['Atherton, CA','Belmont, CA','Brisbane, CA','Burlingame, CA','Colma, CA','Daly City, CA','East Palo Alto, CA','Foster City, CA','Half Moon Bay, CA','Hillsborough, CA','Menlo Park, CA','Millbrae, CA','Pacifica, CA','Portola Valley, CA','Redwood City, CA','San Bruno, CA','San Carlos, CA','San Mateo, CA','South San Francisco, CA','Woodside, CA','Broadmoor, CA','Burlingame Hills, CA','Devonshire, CA','El Granada, CA','Emerald Lake Hills, CA','Highlands-Baywood Park, CA','Kings Mountain, CA','Ladera, CA','La Honda, CA','Loma Mar, CA','Menlo Oaks, CA','Montara, CA','Moss Beach, CA','North Fair Oaks, CA','Palomar Park, CA','Pescadero, CA','Princeton-by-the-Sea, CA','San Gregorio, CA','Sky Londa, CA','West Menlo Park, CA']
  end

  def kind_terms
    ["Arts","Clinics","Education","Entertainment","Farmers' Markets","Government","Human Services","Libraries","Museums","Other","Parks","Sports"]
  end


  # List of Open Eligibility categories for when no search results are found.
  # @return [Array] Arrays of categories and sub-categories.
  # Only returns categories that have been associated with services since
  # it doesn't make sense to include categories that will return no locations.
  def taxonomy_terms
    { "Emergency" =>
        ["Disaster Response", "Emergency Cash", "Cash for Food",
          "Cash for Healthcare", "Cash for Housing", "Cash for Gas",
          "Cash for Utilities", "Emergency Food", "Emergency Shelter",
          "Help Find Missing Persons", "Immediate Safety",
          "Help Escape Violence", "Safe Housing",
          "Psychiatric Emergency Services"
        ],
      "Food" =>
        ["Emergency Food", "Food Delivery", "Food Pantry", "Free Meals",
          "Help Pay for Food", "Food Benefits", "Nutrition"
        ],
      "Housing" =>
        ["Emergency Shelter", "Help Find Housing", "Help Pay for Housing",
          "Cash for Housing", "Cash for Utilities", "Housing Vouchers",
          "Maintenance & Repairs", "Housing Advice", "Foreclosure Counseling",
          "Homebuyer Education", "Residential Housing", "Housing with Support",
          "Long-Term Housing", "Assisted Living", "Independent Living",
          "Nursing Home", "Safe Housing", "Short-Term Housing"
        ],
      "Goods" =>
        ["Baby Supplies", "Baby Clothes", "Clothing", "Baby Clothes",
          "Clothes for School", "Clothes for Work", "Clothing Vouchers",
          "Home Goods", "Blankets & Fans", "Furniture", "Personal Care Items",
          "Technology", "Assistive Technology", "Internet", "Phone Services",
          "Toys & Gifts"
        ],
      "Transit" =>
        ["Help Pay for Transit", "Bus Passes", "Cash for Gas",
          "Transportation", "Transportation for Healthcare",
          "Transportation for School"
        ],
      "Health" =>
        ["Addiction & Recovery", "12-Step", "Detox", "Halfway Housing",
          "Outpatient Treatment", "Residential Treatment", "Sober Living",
          "Dental Care", "End-of-Life Care", "Bereavement", "Hospice",
          "Pain Management", "Health Education", "Daily Life Skills",
          "Disease Management", "Family Planning", "Nutrition",
          "Parenting Education", "Sex Education", "Understand Disability",
          "Understand Mental Health", "Help Pay for Healthcare",
          "Cash for Healthcare", "Discounted Healthcare", "Health Insurance",
          "Medical Supplies", "Prescription Assistance",
          "Transportation for Healthcare", "Medical Care",
          "Alternative Medicine", "Assistive Technology", "Birth Control",
          "Checkup & Test", "Disability Screening", "Disease Screening",
          "Hearing Tests", "Mental Health Evaluation", "Pregnancy Tests",
          "Vision Tests", "Maternity Care", "Personal Hygiene",
          "Prevent & Treat", "Counseling", "HIV Treatment", "Nursing Home",
          "Specialized Therapy", "Vaccinations", "Outpatient Treatment",
          "Psychiatric Emergency Services"
        ],
      "Money" =>
        ["Emergency Cash", "Financial Assistance", "Help Pay for Childcare",
          "Help Pay for Food", "Help Pay for Housing", "Help Pay for Transit",
          "Help Pay for Work Expenses", "Government Benefits",
          "Disability Benefits", "Food Benefits", "Retirement Benefits",
          "Understand Government Programs", "Vouchers", "Clothing Vouchers",
          "Housing Vouchers", "Financial Education", "Foreclosure Counseling",
          "Savings Program", "Insurance", "Health Insurance",
          "Home & Renters Insurance", "Tax Preparation"
        ],
      "Care" =>
        ["Adoption & Foster Care", "Adoption & Foster Placement",
          "Adoption & Foster Parenting", "Adoption Planning",
          "Post-Adoption Support", "Animal Welfare", "Daytime Care",
          "Adult Daycare", "Afterschool Care", "Childcare", "Child Daycare",
          "Day Camp", "Preschool", "Recreation", "Relief for Caregivers",
          "End-of-Life Care", "Bereavement", "Hospice", "Pain Management",
          "Navigating the System", "Help Fill out Forms", "Help Find Housing",
          "Help Find Work", "Residential Care", "Assisted Living",
          "Residential Treatment", "Nursing Home", "Support Network",
          "Counseling", "Help Hotlines", "Home Visiting", "In-Home Support",
          "Mentoring", "One-on-One Support", "Peer Support",
          "Spiritual Support", "Support Groups", "12-Step",
          "Parenting Education", "Virtual Support"
        ],
      "Education" =>
        ["Help Find School", "Help Pay for School", "Books",
          "Financial Aid & Loans", "More Education", "Alternative Education",
          "English as a Second Language (ESL)", "Financial Education",
          "Foreign Languages", "GED/High-School Equivalency",
          "Health Education", "Supported Employment", "Special Education",
          "Tutoring", "Preschool", "Screening & Exams", "GED/High-School",
          "English as a Second Language (ESL)", "Skills & Training",
          "Basic Literacy", "Computer Class", "Daily Life Skills",
          "Interview Training", "Resume Development", "Skills Assessment",
          "Specialized Training", "Technology", "Assistive Technology"
        ],
      "Work" => ["Help Find Work", "Job Placement", "Supported Employment",
        "Help Pay for Work Expenses", "Skills & Training", "Basic Literacy",
        "Computer Class", "GED/High-School Equivalency", "Interview Training",
        "Resume Development", "Skills Assessment", "Specialized Training",
        "Supported Employment", "Workplace Rights"
      ],
      "Legal" =>
        ["Advocacy & Legal Aid", "Adoption & Foster Care",
          "Adoption & Foster Placement", "Adoption Planning",
          "Post-Adoption Support", "Citizenship & Immigration",
          "Discrimination & Civil Rights", "Guardianship",
          "Understand Government Programs", "Workplace Rights", "Mediation",
          "Representation", "Translation & Interpretation"
        ]
    }
  end

end
