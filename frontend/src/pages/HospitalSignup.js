import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../api';
import './AuthPage.css';

// List of Indian States and Union Territories with their Districts
const STATES_AND_DISTRICTS = {
  'Andhra Pradesh': [
    'Alluri Sitharama Raju',
    'Anakapalli',
    'Ananthapuramu',
    'Annamayya',
    'Bapatla',
    'Chittoor',
    'Dr. B.R. Ambedkar Konaseema',
    'East Godavari',
    'Eluru',
    'Guntur',
    'Kakinada',
    'Krishna',
    'Kurnool',
    'Nandyal',
    'Ntr',
    'Palnadu',
    'Parvathipuram Manyam',
    'Prakasam',
    'Sri Potti Sriramulu Nellore',
    'Sri Sathya Sai',
    'Srikakulam',
    'Tirupati',
    'Visakhapatnam',
    'Vizianagaram',
    'West Godavari',
    'Y.S.R. Kadapa',
  ],
  'Arunachal Pradesh': [
    'Anjaw',
    'Bichom',
    'Changlang',
    'Dibang Valley',
    'East Kameng',
    'East Siang',
    'Kamle',
    'Keyi Panyor',
    'Kra Daadi',
    'Kurung Kumey',
    'Leparada',
    'Lohit',
    'Longding',
    'Lower Dibang Valley',
    'Lower Siang',
    'Lower Subansiri',
    'Namsai',
    'Pakke Kessang',
    'Papum Pare',
    'Shi Yomi',
    'Siang',
    'Tawang',
    'Tirap',
    'Upper Siang',
    'Upper Subansiri',
    'West Kameng',
    'West Siang',
  ],
  'Assam': [
    'Baksa',
    'Barpeta',
    'Biswanath',
    'Bongaigaon',
    'Cachar',
    'Charaideo',
    'Chirang',
    'Darrang',
    'Dhemaji',
    'Dhubri',
    'Dibrugarh',
    'Dima Hasao (North Cachar Hills)',
    'Goalpara',
    'Golaghat',
    'Hailakandi',
    'Hojai',
    'Jorhat',
    'Kamrup',
    'Kamrup Metropolitan',
    'Karbi Anglong',
    'Karimganj',
    'Kokrajhar',
    'Lakhimpur',
    'Majuli',
    'Morigaon',
    'Nagaon',
    'Nalbari',
    'Sivasagar',
    'Sonitpur',
    'South Salmara-Mankachar',
    'Tinsukia',
    'Udalguri',
    'West Karbi Anglong',
    'Tamulpur',
    'Bajali',
  ],
  'Bihar': [
    'Araria',
    'Arwal',
    'Aurangabad',
    'Banka',
    'Begusarai',
    'Bhagalpur',
    'Bhojpur',
    'Buxar',
    'Darbhanga',
    'East Champaran (Motihari)',
    'Gaya',
    'Gopalganj',
    'Jamui',
    'Jehanabad',
    'Kaimur (Bhabua)',
    'Katihar',
    'Khagaria',
    'Kishanganj',
    'Lakhisarai',
    'Madhepura',
    'Madhubani',
    'Munger (Monghyr)',
    'Muzaffarpur',
    'Nalanda',
    'Nawada',
    'Patna',
    'Purnia (Purnea)',
    'Rohtas',
    'Saharsa',
    'Samastipur',
    'Saran (Chhapra)',
    'Sheikhpura',
    'Sheohar',
    'Sitamarhi',
    'Siwan',
    'Supaul',
    'Vaishali (Hajipur)',
    'West Champaran (Bettiah)',
  ],
  'Chhattisgarh': [
    'Balod',
    'Baloda Bazar',
    'Balrampur',
    'Bastar',
    'Bemetara',
    'Bijapur',
    'Bilaspur',
    'Dantewada (South Bastar)',
    'Dhamtari',
    'Durg',
    'Gariaband',
    'Gaurela-Pendra-Marwahi',
    'Janjgir-Champa',
    'Jashpur',
    'Kabirdham (Kawardha)',
    'Kanker (North Bastar)',
    'Kondagaon',
    'Korba',
    'Koriya',
    'Mahasamund',
    'Mungeli',
    'Narayanpur',
    'Raigarh',
    'Raipur',
    'Rajnandgaon',
    'Sukma',
    'Surajpur',
    'Surguja',
    'Manendragarh–Chirmiri–Bharatpur',
    'Mohla–Manpur–Ambagarh Chowki',
    'Sarangarh–Bilaigarh',
    'Shakti',
    'Khairagarh–Chhuikhadan–Gandai',
  ],
  'Andaman and Nicobar Islands': [
    'Nicobars',
    'North And Middle Andaman',
    'South Andamans',
  ],
  'Chandigarh': [
    'Chandigarh',
  ],
  'Dadra and Nagar Haveli and Daman and Diu': [
    'Dadra And Nagar Haveli',
    'Daman',
    'Diu',
  ],
  'Delhi': [
    'Central',
    'East',
    'New Delhi',
    'North',
    'North East',
    'North West',
    'Shahdara',
    'South',
    'South East',
    'South West',
    'West',
  ],
  'Goa': [
    'North Goa',
    'South Goa',
  ],
  'Gujarat': [
    'Ahmedabad',
    'Amreli',
    'Anand',
    'Aravalli',
    'Banaskantha (Palanpur)',
    'Bharuch',
    'Bhavnagar',
    'Botad',
    'Chhota Udaipur',
    'Dahod',
    'Dang (Ahwa)',
    'Devbhoomi Dwarka',
    'Gandhinagar',
    'Gir Somnath',
    'Jamnagar',
    'Junagadh',
    'Kheda (Nadiad)',
    'Kutch (Bhuj)',
    'Mahisagar',
    'Mehsana',
    'Morbi',
    'Narmada (Rajpipla)',
    'Navsari',
    'Panchmahal (Godhra)',
    'Patan',
    'Porbandar',
    'Rajkot',
    'Sabarkantha (Himmatnagar)',
    'Surat',
    'Surendranagar',
    'Tapi (Vyara)',
    'Vadodara',
    'Valsad',
  ],
  'Haryana': [
    'Ambala',
    'Bhiwani',
    'Charkhi Dadri',
    'Faridabad',
    'Fatehabad',
    'Gurugram (Gurgaon)',
    'Hisar',
    'Jhajjar',
    'Jind',
    'Kaithal',
    'Karnal',
    'Kurukshetra',
    'Mahendragarh',
    'Nuh (Mewat)',
    'Palwal',
    'Panchkula',
    'Panipat',
    'Rewari',
    'Rohtak',
    'Sirsa',
    'Sonipat',
    'Yamunanagar',
  ],
  'Himachal Pradesh': [
    'Bilaspur',
    'Chamba',
    'Hamirpur',
    'Kangra',
    'Kinnaur',
    'Kullu',
    'Lahaul and Spiti',
    'Mandi',
    'Shimla',
    'Sirmaur (Sirmour)',
    'Solan',
    'Una',
  ],
  'Jammu and Kashmir': [
    'Anantnag',
    'Bandipora',
    'Baramulla',
    'Budgam',
    'Doda',
    'Ganderbal',
    'Jammu',
    'Kathua',
    'Kishtwar',
    'Kulgam',
    'Kupwara',
    'Poonch',
    'Pulwama',
    'Rajouri',
    'Ramban',
    'Reasi',
    'Samba',
    'Shopian',
    'Srinagar',
    'Udhampur',
  ],
  'Jharkhand': [
    'Bokaro',
    'Chatra',
    'Deoghar',
    'Dhanbad',
    'Dumka',
    'East Singhbhum (Jamshedpur)',
    'Garhwa',
    'Giridih',
    'Godda',
    'Gumla',
    'Hazaribagh',
    'Jamtara',
    'Khunti',
    'Koderma',
    'Latehar',
    'Lohardaga',
    'Pakur',
    'Palamu',
    'Ramgarh',
    'Ranchi',
    'Sahibganj',
    'Seraikela-Kharsawan',
    'Simdega',
    'West Singhbhum (Chaibasa)',
  ],
  'Karnataka': [
    'Bagalkote',
    'Ballari (Bellary)',
    'Belagavi (Belgaum)',
    'Bengaluru Rural',
    'Bengaluru Urban',
    'Bidar',
    'Chamarajanagar',
    'Chikballapur',
    'Chikkamagaluru',
    'Chitradurga',
    'Dakshina Kannada (Mangaluru)',
    'Davanagere',
    'Dharwad',
    'Gadag',
    'Hassan',
    'Haveri',
    'Kalaburagi (Gulbarga)',
    'Kodagu (Coorg)',
    'Kolar',
    'Koppal',
    'Mandya',
    'Mysuru (Mysore)',
    'Raichur',
    'Ramanagara',
    'Shivamogga (Shimoga)',
    'Tumakuru (Tumkur)',
    'Udupi',
    'Uttara Kannada (Karwar)',
    'Vijayapura (Bijapur)',
    'Yadgir',
    'Chikkodi',
  ],
  'Kerala': [
    'Alappuzha',
    'Ernakulam',
    'Idukki',
    'Kannur',
    'Kasaragod',
    'Kollam',
    'Kottayam',
    'Kozhikode',
    'Malappuram',
    'Palakkad',
    'Pathanamthitta',
    'Thiruvananthapuram',
    'Thrissur',
    'Wayanad',
  ],
  'Ladakh': [
    'Leh',
    'Kargil',
  ],
  'Lakshadweep': [
    'Lakshadweep District',
  ],
  'Madhya Pradesh': [
    'Agar Malwa',
    'Alirajpur',
    'Anuppur',
    'Ashoknagar',
    'Balaghat',
    'Barwani',
    'Betul',
    'Bhind',
    'Bhopal',
    'Burhanpur',
    'Chachaura',
    'Chhatarpur',
    'Chhindwara',
    'Damoh',
    'Datia',
    'Dewas',
    'Dhar',
    'Dindori',
    'Guna',
    'Gwalior',
    'Harda',
    'Hoshangabad (Narmadapuram)',
    'Indore',
    'Jabalpur',
    'Jhabua',
    'Katni',
    'Khandwa (East Nimar)',
    'Khargone (West Nimar)',
    'Mandla',
    'Mandsaur',
    'Mauganj',
    'Morena',
    'Nagda',
    'Narsinghpur',
    'Neemuch',
    'Niwari',
    'Panna',
    'Raisen',
    'Rajgarh',
    'Ratlam',
    'Rewa',
    'Sagar',
    'Satna',
    'Sehore',
    'Seoni',
    'Shahdol',
    'Shajapur',
    'Sheopur',
    'Shivpuri',
    'Sidhi',
    'Singrauli',
    'Tikamgarh',
    'Ujjain',
    'Umaria',
    'Vidisha',
  ],
  'Maharashtra': [
    'Ahmednagar',
    'Akola',
    'Amravati',
    'Aurangabad (Chhatrapati Sambhajinagar)',
    'Beed',
    'Bhandara',
    'Buldhana',
    'Chandrapur',
    'Dhule',
    'Gadchiroli',
    'Gondia',
    'Hingoli',
    'Jalgaon',
    'Jalna',
    'Kolhapur',
    'Latur',
    'Mumbai City',
    'Mumbai Suburban',
    'Nagpur',
    'Nanded',
    'Nandurbar',
    'Nashik',
    'Osmanabad (Dharashiv)',
    'Palghar',
    'Parbhani',
    'Pune',
    'Raigad',
    'Ratnagiri',
    'Sangli',
    'Satara',
    'Sindhudurg',
    'Solapur',
    'Thane',
    'Wardha',
    'Washim',
    'Yavatmal',
  ],
  'Manipur': [
    'Bishnupur',
    'Chandel',
    'Churachandpur',
    'Imphal East',
    'Imphal West',
    'Jiribam',
    'Kakching',
    'Kamjong',
    'Kangpokpi',
    'Noney',
    'Pherzawl',
    'Senapati',
    'Tamenglong',
    'Tengnoupal',
    'Thoubal',
    'Ukhrul',
  ],
  'Meghalaya': [
    'East Garo Hills',
    'East Jaintia Hills',
    'East Khasi Hills',
    'Eastern West Khasi Hills',
    'North Garo Hills',
    'Ri-Bhoi',
    'South Garo Hills',
    'South West Garo Hills',
    'South West Khasi Hills',
    'West Garo Hills',
    'West Jaintia Hills',
    'West Khasi Hills',
  ],
  'Mizoram': [
    'Aizawl',
    'Champhai',
    'Hnahthial',
    'Khawzawl',
    'Kolasib',
    'Lawngtlai',
    'Lunglei',
    'Mamit',
    'Saitual',
    'Serchhip',
    'Siaha',
  ],
  'Nagaland': [
    'Chümoukedima',
    'Dimapur',
    'Kiphire',
    'Kohima',
    'Longleng',
    'Mokokchung',
    'Mon',
    'Niuland',
    'Noklak',
    'Peren',
    'Phek',
    'Shamator',
    'Tseminyü',
    'Tuensang',
    'Wokha',
    'Zunheboto',
  ],
  'Odisha': [
    'Angul',
    'Balangir',
    'Balasore (Baleswar)',
    'Bargarh (Baragarh)',
    'Bhadrak',
    'Boudh (Bauda)',
    'Cuttack',
    'Deogarh (Debagarh)',
    'Dhenkanal',
    'Gajapati',
    'Ganjam',
    'Jagatsinghpur',
    'Jajpur',
    'Jharsuguda',
    'Kalahandi',
    'Kandhamal',
    'Kendrapara',
    'Keonjhar (Kendujhar)',
    'Khordha',
    'Koraput',
    'Malkangiri',
    'Mayurbhanj',
    'Nabarangpur',
    'Nayagarh',
    'Nuapada',
    'Puri',
    'Rayagada',
    'Sambalpur',
    'Sonepur (Subarnapur)',
    'Sundargarh',
  ],
  'Puducherry': [
    'Puducherry',
    'Karaikal',
    'Mahe',
    'Yanam',
  ],
  'Punjab': [
    'Amritsar',
    'Barnala',
    'Bathinda',
    'Faridkot',
    'Fatehgarh Sahib',
    'Fazilka',
    'Ferozepur',
    'Gurdaspur',
    'Hoshiarpur',
    'Jalandhar',
    'Kapurthala',
    'Ludhiana',
    'Malerkotla',
    'Mansa',
    'Moga',
    'Pathankot',
    'Patiala',
    'Rupnagar (Ropar)',
    'Sahibzada Ajit Singh Nagar (Mohali)',
    'Sangrur',
    'Shahid Bhagat Singh Nagar (Nawanshahr)',
    'Sri Muktsar Sahib',
    'Tarn Taran',
  ],
  'Rajasthan': [
    'Ajmer',
    'Alwar',
    'Anupgarh',
    'Balotra',
    'Banswara',
    'Baran',
    'Barmer',
    'Beawar',
    'Bharatpur',
    'Bhilwara',
    'Bikaner',
    'Bundi',
    'Chittorgarh',
    'Dausa',
    'Deeg',
    'Dholpur',
    'Didwana-Kuchaman',
    'Dudu',
    'Gangapur City',
    'Hanumangarh',
    'Jaipur',
    'Jaipur Rural',
    'Jaisalmer',
    'Jalore',
    'Jhalawar',
    'Jhunjhunu',
    'Jodhpur',
    'Jodhpur Rural',
    'Karauli',
    'Kekri',
    'Khairthal-Tijara',
    'Kota',
    'Nagaur',
    'Neem Ka Thana',
    'Pali',
    'Phalodi',
    'Pratapgarh',
    'Rajsamand',
    'Salumbar',
    'Sanchore',
    'Sawai Madhopur',
    'Shahpura',
    'Sikar',
    'Sirohi',
    'Sri Ganganagar',
    'Tonk',
    'Udaipur',
  ],
  'Sikkim': [
    'Gangtok',
    'Mangan',
    'Namchi',
    'Pakyong',
    'Soreng',
    'Gyalshing (West Sikkim)',
  ],
  'Tamil Nadu': [
    'Ariyalur',
    'Chengalpattu',
    'Chennai',
    'Coimbatore',
    'Cuddalore',
    'Dharmapuri',
    'Dindigul',
    'Erode',
    'Kallakurichi',
    'Kanchipuram',
    'Kanyakumari',
    'Karur',
    'Krishnagiri',
    'Madurai',
    'Mayiladuthurai',
    'Nagapattinam',
    'Namakkal',
    'Nilgiris',
    'Perambalur',
    'Pudukkottai',
    'Ramanathapuram',
    'Ranipet',
    'Salem',
    'Sivagangai',
    'Tenkasi',
    'Thanjavur',
    'Theni',
    'Thoothukudi (Tuticorin)',
    'Tiruchirappalli',
    'Tirunelveli',
    'Tirupathur',
    'Tiruppur',
    'Tiruvallur',
    'Tiruvannamalai',
    'Tiruvarur',
    'Vellore',
    'Viluppuram',
    'Virudhunagar',
  ],
  'Telangana': [
    'Adilabad',
    'Bhadradri Kothagudem',
    'Hanumakonda',
    'Hyderabad',
    'Jagitial',
    'Jangaon',
    'Jayashankar Bhupalpally',
    'Jogulamba Gadwal',
    'Kamareddy',
    'Karimnagar',
    'Khammam',
    'Komaram Bheem Asifabad',
    'Mahabubabad',
    'Mahabubnagar',
    'Mancherial',
    'Medak',
    'Medchal–Malkajgiri',
    'Mulugu',
    'Nagarkurnool',
    'Nalgonda',
    'Narayanpet',
    'Nirmal',
    'Nizamabad',
    'Peddapalli',
    'Rajanna Sircilla',
    'Rangareddy',
    'Sangareddy',
    'Siddipet',
    'Suryapet',
    'Vikarabad',
    'Wanaparthy',
    'Warangal',
    'Yadadri Bhuvanagiri',
  ],
  'Tripura': [
    'Dhalai',
    'Gomati',
    'Khowai',
    'North Tripura',
    'Sepahijala',
    'South Tripura',
    'Unakoti',
    'West Tripura',
  ],
  'Uttar Pradesh': [
    'Agra',
    'Aligarh',
    'Ambedkar Nagar',
    'Amethi',
    'Amroha (J.P. Nagar)',
    'Auraiya',
    'Ayodhya (Faizabad)',
    'Azamgarh',
    'Baghpat',
    'Bahraich',
    'Ballia',
    'Balrampur',
    'Banda',
    'Barabanki',
    'Bareilly',
    'Basti',
    'Bhadohi (Sant Ravidas Nagar)',
    'Bijnor',
    'Budaun',
    'Bulandshahr',
    'Chandauli',
    'Chitrakoot',
    'Deoria',
    'Etah',
    'Etawah',
    'Farrukhabad',
    'Fatehpur',
    'Firozabad',
    'Gautam Buddha Nagar (Noida)',
    'Ghaziabad',
    'Ghazipur',
    'Gonda',
    'Gorakhpur',
    'Hamirpur',
    'Hapur (Panchsheel Nagar)',
    'Hardoi',
    'Hathras (Mahamaya Nagar)',
    'Jalaun',
    'Jaunpur',
    'Jhansi',
    'Kannauj',
    'Kanpur Dehat',
    'Kanpur Nagar',
    'Kasganj',
    'Kaushambi',
    'Kushinagar',
    'Lakhimpur Kheri',
    'Lalitpur',
    'Lucknow',
    'Maharajganj',
    'Mahoba',
    'Mainpuri',
    'Mathura',
    'Mau',
    'Meerut',
    'Mirzapur',
    'Moradabad',
    'Muzaffarnagar',
    'Pilibhit',
    'Pratapgarh',
    'Prayagraj (Allahabad)',
    'Raebareli',
    'Rampur',
    'Saharanpur',
    'Sambhal',
    'Sant Kabir Nagar',
    'Shahjahanpur',
    'Shamli',
    'Shravasti',
    'Siddharthnagar',
    'Sitapur',
    'Sonbhadra',
    'Sultanpur',
    'Unnao',
    'Varanasi',
  ],
  'Uttarakhand': [
    'Almora',
    'Bageshwar',
    'Chamoli',
    'Champawat',
    'Dehradun',
    'Haridwar',
    'Nainital',
    'Pauri Garhwal',
    'Pithoragarh',
    'Rudraprayag',
    'Tehri Garhwal',
    'Udham Singh Nagar',
    'Uttarkashi',
  ],
  'West Bengal': [
    'Alipurduar',
    'Bankura',
    'Birbhum',
    'Cooch Behar',
    'Dakshin Dinajpur (South Dinajpur)',
    'Darjeeling',
    'Hooghly',
    'Howrah',
    'Jalpaiguri',
    'Jhargram',
    'Kalimpong',
    'Kolkata',
    'Malda',
    'Murshidabad',
    'Nadia',
    'North 24 Parganas',
    'Paschim Bardhaman (West Burdwan)',
    'Paschim Medinipur (West Midnapore)',
    'Purba Bardhaman (East Burdwan)',
    'Purba Medinipur (East Midnapore)',
    'Purulia',
    'South 24 Parganas',
    'Uttar Dinajpur (North Dinajpur)',
  ],
};

const STATES_AND_UTS = Object.keys(STATES_AND_DISTRICTS);

function HospitalSignup({ onLogin }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    country: 'India',
    state: '',
    district: '',
    landmark: '',
    establishYear: '',
    opdCharge: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    // Check if user is admin
    const userType = localStorage.getItem('userType');
    const userData = localStorage.getItem('user');
    
    if (userType === 'user' && userData) {
      const user = JSON.parse(userData);
      if (user.role === 'admin') {
        setIsAdmin(true);
      } else {
        navigate('/');
      }
    } else {
      navigate('/');
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!isAdmin) {
        setError('Unauthorized: Only admins can register hospitals');
        setLoading(false);
        return;
      }

      const submitData = {
        ...formData,
        establishYear: parseInt(formData.establishYear),
        opdCharge: formData.opdCharge ? formData.opdCharge.split(',').map(charge => parseFloat(charge.trim())) : [],
      };

      const response = await authAPI.hospitalSignup(submitData);
      setSuccessMessage(`Hospital "${response.data.hospital.name}" created successfully!`);
      setShowSuccessModal(true);
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        password: '',
        country: 'India',
        state: '',
        district: '',
        landmark: '',
        establishYear: '',
        opdCharge: '',
      });
      
      // Redirect to admin dashboard after 2 seconds
      setTimeout(() => {
        navigate('/admin/dashboard');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="auth-page">
        <div className="container">
          <div className="card auth-card">
            <h2>Access Denied</h2>
            <p style={{ color: '#dc3545', textAlign: 'center', marginTop: '1rem' }}>
              Only admins can register new hospitals. Please contact an administrator.
            </p>
            <p style={{ textAlign: 'center', marginTop: '1rem' }}>
              <Link to="/" className="btn btn-secondary">
                Back to Home
              </Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="container">
        {/* Success Modal */}
        {showSuccessModal && (
          <div className="modal-overlay" onClick={() => setShowSuccessModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>✅ Success</h3>
              </div>
              <div className="modal-body">
                <p>{successMessage}</p>
                <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#666' }}>
                  The hospital has been registered and is now available in your system.
                </p>
              </div>
              <div className="modal-footer">
                <button 
                  className="btn btn-primary" 
                  onClick={() => setShowSuccessModal(false)}
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        )}
        
        <div className="card auth-card" style={{ maxWidth: '800px', margin: '2rem auto' }}>
          <h2>Hospital Sign Up</h2>
          <p style={{ color: '#667eea', textAlign: 'center', marginBottom: '1rem' }}>
            Admin: Register a new hospital
          </p>
          
          {error && <div className="alert alert-error">{error}</div>}
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Hospital Name <span className="required">*</span></label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Email Address <span className="required">*</span></label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Password <span className="required">*</span></label>
              <div className="password-input-group">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength="6"
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? '👁️‍🗨️' : '👁️'}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label>Country <span className="required">*</span></label>
              <input
                type="text"
                name="country"
                value={formData.country}
                disabled
                style={{ backgroundColor: '#f0f0f0', cursor: 'not-allowed' }}
              />
            </div>

            <div className="form-group">
              <label>State/Union Territory <span className="required">*</span></label>
              <select
                name="state"
                value={formData.state}
                onChange={handleChange}
                required
              >
                <option value="">Select State/UT</option>
                {STATES_AND_UTS.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>District Name <span className="required">*</span></label>
              <select
                name="district"
                value={formData.district}
                onChange={handleChange}
                required
                disabled={!formData.state}
              >
                <option value="">
                  {formData.state ? 'Select District' : 'Select State First'}
                </option>
                {formData.state && STATES_AND_DISTRICTS[formData.state] && 
                  STATES_AND_DISTRICTS[formData.state].map((district) => (
                    <option key={district} value={district}>
                      {district}
                    </option>
                  ))
                }
              </select>
            </div>

            <div className="form-group">
              <label>Landmark/Location Details</label>
              <input
                type="text"
                name="landmark"
                value={formData.landmark}
                onChange={handleChange}
                placeholder="e.g., Near City Hospital, Main Road, etc."
              />
            </div>

            <div className="form-group">
              <label>Establish Year <span className="required">*</span></label>
              <input
                type="number"
                name="establishYear"
                value={formData.establishYear}
                onChange={handleChange}
                required
                min="1800"
                max={new Date().getFullYear()}
              />
            </div>

            <div className="form-group">
              <label>OPD Charges (comma separated)</label>
              <input
                type="text"
                name="opdCharge"
                value={formData.opdCharge}
                onChange={handleChange}
                placeholder="e.g., 500, 1000, 1500"
              />
            </div>

            <button type="submit" className="btn" disabled={loading}>
              {loading ? 'Creating Account...' : 'Sign Up'}
            </button>
          </form>

          <p style={{ marginTop: '1rem', textAlign: 'center' }}>
            Already have an account? <Link to="/hospital/login">Login</Link>
          </p>
          
          <p style={{ marginTop: '0.5rem', textAlign: 'center' }}>
            <Link to="/">Back to Home</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default HospitalSignup;
