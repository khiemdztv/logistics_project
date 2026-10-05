import fs from 'fs';
import path from 'path';

const publicDir = path.resolve('public');

const masterRagContext = `# BỘ DỮ LIỆU HUẤN LUYỆN VÀ TRI THỨC ĐIỀU HÀNH HÀNG HẢI - TÀU DOLPHIN 01 (RAG MARITIME MASTER DATABASE)
Phiên bản: 2.0 (Chuẩn MARPOL Annex II, FOSFA, INTERTANKO, CHRIS Manual & SOP Tàu Dolphin 01)
Tàu áp dụng: DOLPHIN 01 (Tàu chở Dầu & Hóa chất 34,000 DWT - Hệ thống hầm hàng bọc sơn Pure Epoxy)

================================================================================
I. QUY TRÌNH HOẠT ĐỘNG CHUẨN CỦA HỆ THỐNG WEBSITE DOLPHIN TANKOPS
================================================================================
1. Giai đoạn 1: Khởi tạo & Phân tích Tương thích (Step 1)
   - Sĩ quan nhập thông tin: Lô hàng cũ vừa dỡ (Previous Cargo), Lô hàng mới sắp nhận (New Cargo), Hầm hàng xử lý (Hold #), Hải trình và ghi chú đặc biệt.
   - Hệ thống tự động:
     + Đối chiếu Quy tắc FOSFA Banned Immediate Previous Cargoes: Kiểm tra xem hàng cũ có nằm trong danh mục cấm 3 chuyến gần nhất trước khi chở Dầu thực vật/chất béo hay không.
     + Đối chiếu Ma trận Tương thích Hóa chất & Lớp bọc Pure Epoxy (Jotun Resistance Guide).
     + Tự động phân nhánh tiêu chuẩn kiểm tra tối ưu:
       * WALL WASH STANDARD: Áp dụng bắt buộc cho hàng tinh khiết, dung môi công nghiệp (Methanol, Ethanol, Acetone, MEG, IPA, Benzene, Toluene, Xylene), Nhiên liệu hàng không Jet A-1, Hóa chất polyme (Styrene, VAM).
       * WATER WHITE STANDARD: Áp dụng cho hàng dầu thô (Crude Oil), dầu nhiên liệu thông thường (DPP, HFO, MGO), dầu mỏ thương phẩm thông thường không đòi hỏi độ tinh khiết hóa học siêu cao.
     + Tự động đưa ra Khuyến cáo Sĩ quan & Quy trình Rửa hầm Tiêu chuẩn 5-7 bước.

2. Giai đoạn 2: Thực hiện Kiểm tra theo Phân nhánh (Step 2)
   - Nhánh 1 (Water White Standard - Kiểm tra cảm quan số hóa):
     + Checklist 7 khu vực: 1.Trần hầm, 2.Vách mũi, 3.Vách lái, 4.Vách mạn trái (Port), 5.Vách mạn phải (Starboard), 6.Đáy hầm, 7.Đường ống / giếng thu (Piping / Sump).
     + Tiêu chí cốt lõi: SẠCH (Clean) - KHÔ (Dry) - KHÔNG MÙI (Odour-free) - KHÔNG CẶN BẨN/GỈ SẮT (Rust/Foreign matter-free).
     + Chụp ảnh bằng chứng cho từng khu vực. Nếu có vị trí "Không đạt", hệ thống định vị chính xác vị trí cần rửa lại.
   - Nhánh 2 (Wall Wash Standard - Kiểm tra định lượng bằng hóa chất):
     + Sĩ quan thực hiện lấy mẫu rửa vách (Wall Wash) bằng dung môi Methanol/Acetone phòng thí nghiệm theo SOP.
     + Nhập 5 chỉ tiêu cốt lõi:
       1. Độ mặn / Clorua (Chloride): Giới hạn đạt <= 2 ppm (hoặc <= 5 ppm theo hợp đồng cụ thể).
       2. Chỉ số thời gian Thuốc tím (PTT / Permanganate Time): Giới hạn đạt >= 50 phút (đối với Methanol/Dung môi tinh khiết) hoặc >= 30 phút.
       3. Độ màu Hazen / APHA (Color Scale): Giới hạn đạt <= 10 đến 20 APHA (bước sóng 455 nm).
       4. Dư lượng Hydrocarbon (Water Miscibility): Giới hạn đạt <= 10 đến 35 ppm (Mẫu pha nước cất trong suốt, không đục).
       5. Độ dẫn điện (Conductivity) hoặc NVM: NVM < 10 ppm.
     + AI Tự động chẩn đoán: Nếu có chỉ số KHÔNG ĐẠT, AI lập tức phân tích nguyên nhân vật lý/hóa học và đề xuất phương án rửa lại (Re-cleaning SOP) chính xác.

3. Giai đoạn 3: Tổng hợp, Nghiệm thu & Xuất Báo cáo (Step 3)
   - Đóng gói toàn bộ nhật ký kiểm tra, kết quả test định lượng, bằng chứng ảnh chụp, chữ ký số Sĩ quan.
   - Xuất Báo cáo Điện tử (Cargo Hold Cleanliness Certificate) chuẩn INTERTANKO phục vụ việc trao Thông báo sẵn sàng làm hàng (NOR - Notice of Readiness) và trình Giám định viên độc lập (Cargo Surveyor).

================================================================================
II. MA TRẬN PHÂN LOẠI NHÓM HÀNG HÓA VÀ QUY TRÌNH LÀM SẠCH (CLEANING SOP)
================================================================================
1. Nhóm Hàng Dầu Thô & Dầu Đen (Crude Oil & DPP - Heavy Fuel Oil, Fuel Oil, Bitumen)
   - Đặc tính: Độ nhớt cao, bám dính cực mạnh, nhiều cặn bùn paraffin, asphaltene.
   - Quy trình rửa:
     + Rửa bằng dầu thô áp lực cao (Crude Oil Washing - COW) khi đang dỡ hàng để đánh tan bùn cặn đáy.
     + Rửa nước biển nóng (65 - 80°C) kết hợp chất tẩy rửa gốc dầu mỏ chuyên dụng (Unitor Seaclean / Marclean Hydrocarbon Remover).
     + Tráng lại hoàn toàn bằng nước ngọt/nước khử khoáng để khử muối biển.
     + Thông gió kiểm tra khí an toàn: O2 >= 20.9%, LEL <= 1%, H2S = 0 ppm.

2. Nhóm Dầu Thực Vật (Crude Palm Oil - CPO, RBD Palm Olein, Dầu đậu nành, Dầu dừa)
   - Đặc tính: Dễ bị oxy hóa và polyme hóa khô cứng nếu sấy nóng quá sớm. Dễ ôi thiu, tạo axit béo tự do (FFA) và bám mùi hữu cơ.
   - Quy trình rửa:
     + BƯỚC 1: Xịt rửa xả trôi bằng NƯỚC BIỂN MÁT (Nhiệt độ môi trường < 40°C) ngay sau khi dỡ hàng. TUYỆT ĐỐI KHÔNG DÙNG NƯỚC NÓNG Ở BƯỚC NÀY vì nhiệt độ cao làm dầu thực vật bị "nướng chín" và keo dính chặt vào lớp bọc hầm.
     + BƯỚC 2: Rửa tuần hoàn dung dịch tẩy rửa TÍNH KIỀM MẠNH (Alkaline Cleaner như Unitor Alkaclean, Careclean Alkaline, Grato 50 nồng độ 2 - 5%) kết hợp nước nóng (75 - 85°C) để xà phòng hóa triệt để axit béo và cặn mỡ.
     + BƯỚC 3: Tráng nước ngọt nóng và tráng nước khử ion (DI Water) ở lần xả cuối.
     + BƯỚC 4: Sấy khô và kiểm tra WWT: Phép thử Permanganate (PTT) và Axit béo dư (FFA Test).

3. Nhóm Hóa Chất & Dung Môi Tinh Khiết (High-Purity Solvents: Methanol, Ethanol, MEG, IPA, Acetone, Benzene, Toluene, Xylene)
   - Đặc tính: Yêu cầu độ tinh khiết siêu cao (High Purity Standard). Nhạy cảm tuyệt đối với dư lượng Hydrocarbon, Clorua, và tạp chất oxy hóa.
   - Quy trình rửa:
     + Rửa nước ngọt nóng (70°C).
     + Nếu hàng trước là dầu nặng hoặc dầu béo: Xông hơi dung môi trung gian (Methanol/Acetone Washing / Solvent Injection).
     + Tráng kỹ bằng Nước khử ion (DI Water) với hàm lượng Clorua < 0.1 ppm.
     + Sấy khô tuyệt đối bằng khí sấy khô không dầu (Oil-free Dry Air).
     + Lấy mẫu Wall Wash bằng Methanol tinh khiết quang phổ (Spectro-grade Methanol).

4. Nhóm Nhiên Liệu Hàng Không & Nhiên Liệu Sạch (Jet A-1, Avgas, ULSD, Gasoline)
   - Đặc tính: Yêu cầu nghiêm ngặt chống tạp chất vi lượng và vi hạt làm tắc nghẽn bộ lọc máy bay.
   - Kiểm tra đặc thù: Phép thử màng lọc Millipore (Millipore Membrane Filter Test 0.45 micron) để đếm hạt gỉ sắt và kiểm tra màu APHA <= 10.

5. Nhóm Hóa Chất Monomer Polyme Hóa (Styrene Monomer, Vinyl Acetate Monomer - VAM)
   - Đặc tính: Chứa chất ức chế polyme hóa (Inhibitor như TBC). Dễ bị kích hoạt tự liên kết thành mạng lưới nhựa cứng vĩnh viễn nếu gặp ion kim loại (gỉ sắt) hoặc nhiệt độ cao.
   - Xử lý: Rửa lạnh bằng dung môi trung gian (Acetone/Methanol), tuyệt đối không để hầm có rỉ sét (phải sơn bảo dưỡng hoặc thụ động hóa). Kiểm tra chất không bay hơi (NVM < 10 ppm).

================================================================================
III. HƯỚNG DẪN CHI TIẾT CÁC BÀI THỬ NGHIỆM HÓA CHẤT VÁCH HẦM (WALL WASH TEST KIT)
================================================================================
1. Kỹ thuật Lấy Mẫu Rửa Vách (WWT Sampling Technique)
   - Dụng cụ: Phễu thủy tinh, chai mẫu vô trùng, ống đong Nessler 50/100ml, bình xịt Methanol tinh khiết phòng thí nghiệm.
   - Vị trí: Lấy mẫu tại tối thiểu 5 điểm đại diện trong mỗi hầm (Vách mũi, vách lái, vách mạn trái, vách mạn phải, đáy hầm).
   - Quy tắc vàng: Bắt buộc sĩ quan phải đeo GĂNG TAY NITRILE MỚI KHÔNG BỘT. Tuyệt đối không để da tay chạm vào miệng chai hay phễu, vì mồ hôi tay chứa muối Clorua sẽ gây ô nhiễm mẫu (tạo kết quả nhiễm mặn giả).

2. Phép thử Hydrocarbon (Hydrocarbon / Water Miscibility Test - ASTM D1722)
   - Nguyên lý: Hydrocarbon không tan trong nước. Khi trộn mẫu quét vách (Methanol) với nước khử khoáng (DI Water), nếu có hydrocarbon sẽ tạo nhũ tương đục trắng sữa hoặc ánh váng dầu.
   - Tỷ lệ pha: 15 ml mẫu Methanol + 45 ml nước DI (hoặc 25 ml mẫu + 75 ml nước DI). Lắc đều 15 giây, để yên 15-20 phút.
   - Đánh giá:
     + ĐẠT: Dung dịch trong suốt như nước cất dưới ánh đèn pin trên nền đen.
     + KHÔNG ĐẠT: Dung dịch bị đục mờ, ánh xanh opalescent hoặc tạo váng dầu nổi (Dư lượng Hydrocarbon > 35 ppm).

3. Phép thử Clorua / Độ mặn tồn dư (Chloride Test - ASTM D512)
   - Hóa chất: Dung dịch Bạc Nitrat (AgNO3 5 - 10%) và Axit Nitric (HNO3 1:1).
   - Phản ứng: Ag+ + Cl- -> AgCl (Kết tủa trắng bạc clorua làm đục dung dịch).
   - Quy trình: Lấy 100 ml mẫu nước rửa vách bằng nước DI. Nhỏ 2 giọt Axit Nitric (để triệt tiêu cặn carbonat/dầu béo gây đục giả), sau đó nhỏ 5 giọt dung dịch AgNO3.
   - So màu đối chứng với ống chuẩn Chloride 1 ppm / 2 ppm:
     + ĐẠT: Mẫu trong suốt tương đương ống chuẩn (< 2 ppm).
     + KHÔNG ĐẠT: Mẫu đục trắng sữa vượt mức 2 ppm (Dư lượng muối biển sau khi tráng nước ngọt chưa sạch).

4. Phép thử Thời gian Phai màu Thuốc tím (Permanganate Time Test - PTT / PMTT - ASTM D1363)
   - Nguyên lý: Kali Permanganat (KMnO4) là chất oxy hóa mạnh màu hồng tím. Khi gặp tạp chất hữu cơ dễ bị oxy hóa, thuốc tím sẽ bị khử thành Mangan Dioxit (MnO2) và phai sang màu vàng cam/hổ phách.
   - Điều kiện: Ổn nhiệt mẫu ở 15.0°C ± 0.5°C (đối với Methanol) hoặc 25.0°C ± 0.5°C (đối với Acetone) trong bể cách nhiệt.
   - Thao tác: Cho 50 ml mẫu vào ống Nessler, thêm 2 ml dung dịch KMnO4 0.02%. Bấm giờ cho đến khi màu phai trùng với ống màu chuẩn Platinum-Cobalt.
   - Đánh giá:
     + ĐẠT: Thời gian giữ màu hồng >= 50 phút (hoặc >= 30 phút theo yêu cầu tối thiểu).
     + KHÔNG ĐẠT: Mất màu trong vòng 5 - 20 phút -> Hầm còn sót cặn hữu cơ, dầu mỏ hoặc chất khử.

5. Phép thử Độ màu Hazen / APHA (APHA Platinum-Cobalt Color - ASTM D1209)
   - Đo màu sắc mẫu đối chiếu thang APHA (0 đến 500) ở bước sóng 455 nm.
   - ĐẠT: Chỉ số APHA <= 10 - 20 (Dung dịch hoàn toàn không có ánh vàng, không lẫn cặn sẫm màu).

6. Phép thử Axit Wash Color (Acid Wash Color Test - ASTM D848)
   - Lắc mẫu với Axit Sunfuric đặc (H2SO4 96%). Phát hiện cặn hydrocarbon thơm (Benzene/Toluene/Xylene) biến màu axit ở lớp dưới.

================================================================================
IV. BẢNG HƯỚNG DẪN CHẨN ĐOÁN LỖI VÀ PHƯƠNG ÁN RỬA LẠI (TROUBLESHOOTING & RE-CLEANING SOP)
================================================================================
1. Sự cố 1: RỚT CHỈ SỐ PTT (PTT < 30 hoặc < 50 phút)
   - Nguyên nhân khả dĩ:
     + Vách hầm còn tồn dư màng dầu mỏng (Hydrocarbon film) hoặc cặn hữu cơ từ chuyến hàng trước chưa bị phân hủy hết.
     + Lớp sơn bọc Epoxy đã ngậm (absorb) dung môi hữu cơ từ hàng trước và đang tiết ngược ra bề mặt.
     + Nước rửa ban đầu có chứa tạp chất hữu cơ.
   - Phương án khắc phục & Rửa lại:
     + Bước 1: Rửa tuần hoàn hầm bằng dung dịch chất tẩy rửa nhũ hóa dầu mỏ (Unitor Seaclean Plus hoặc Marclean HCR) nồng độ 1 - 2% pha nước nóng 70 - 75°C trong 2 - 3 giờ.
     + Bước 2: Xông hơi hầm hàng (Steaming) hoặc xả nước ngọt nóng ở 80°C liên tục 1 - 2 giờ để thúc đẩy bay hơi dung môi ngậm trong lớp Epoxy.
     + Bước 3: Tráng nước DI, thông gió sấy khô cưỡng bức ở nhiệt độ cao và tiến hành test lại PTT.

2. Sự cố 2: RỚT CHỈ SỐ CLORUA / ĐỘ MẶN (Chloride > 2 ppm)
   - Nguyên nhân khả dĩ:
     + Tráng nước ngọt sau khi rửa nước biển chưa đủ lưu lượng hoặc thời gian.
     + Nước đọng tại các góc khuất, lỗ thoát nước, hốc giếng thu (sump) chứa muối biển cô đặc lại khi sấy.
     + Sai sót con người: Thao tác lấy mẫu bằng tay không, mồ hôi làm nhiễm mặn mẫu thử.
   - Phương án khắc phục & Rửa lại:
     + Bước 1: Kiểm tra lại quy trình test có đeo găng tay Nitrile sạch không.
     + Bước 2: Phun tráng áp lực cao toàn bộ trần hầm và vách bằng NƯỚC KHỬ KHOÁNG (DI WATER) hoặc Nước ngọt có độ mặn < 5 ppm. Chú ý bơm hút khô toàn bộ giếng thu đáy hầm.
     + Bước 3: Sấy khô và test lại Chloride với dung dịch AgNO3 10%.

3. Sự cố 3: RỚT PHÉP THỬ HYDROCARBON (Dung dịch bị đục sữa / ánh xanh)
   - Nguyên nhân khả dĩ: Dư lượng dầu nặng, dầu nhờn bám dính cục bộ trên trần hầm, mặt sau thang dây hoặc đầu vòi phun butterworth.
   - Phương án khắc phục:
     + Phun cục bộ dung dịch tẩy rửa Alkaline hoặc Dung môi tẩy dầu đậm đặc lên các vị trí góc chết.
     + Rửa máy áp lực cao nước nóng 80°C kết hợp hóa chất Unitor Seaclean.
     + Tráng nước ngọt và sấy khô hoàn toàn.

4. Sự cố 4: RỚT ĐỘ MÀU APHA (Mẫu bị ngả vàng / APHA > 20)
   - Nguyên nhân khả dĩ: Bụi gỉ sắt (Iron oxide) từ kết cấu chưa bảo dưỡng hoặc ố màu hữu cơ.
   - Phương án khắc phục: Rửa hầm bằng dung dịch axit hữu cơ nhẹ (Passivating Liquid / Rust Remover / Citric Acid 2%) để tẩy sạch ố vàng rỉ sét, tráng lại bằng nước ngọt.

================================================================================
V. CÁC QUY ĐỊNH PHÁP LÝ QUỐC TẾ BẮT BUỘC (LEGAL & REGULATORY CONSTRAINTS)
================================================================================
1. Tiêu chuẩn FOSFA International (Federation of Oils, Seeds and Fats Associations)
   - Quản lý vận chuyển dầu ăn, dầu thực vật và chất béo lỏng:
   - FOSFA Banned Immediate Previous Cargoes: Danh mục các chất bị CẤM TUYỆT ĐỐI làm hàng trước trong 3 chuyến liên tiếp gần nhất (Ví dụ: Chì hữu cơ, Dầu biến thế chứa PCB, Hợp chất Phenol độc hại, Amin độc tính cao, Epichlorohydrin...).
   - FOSFA Acceptable Previous Cargoes: Danh mục các chất được phép làm hàng trước nếu thỏa mãn điều kiện làm sạch và tráng rửa tiêu chuẩn.

2. Tiêu chuẩn IMO MARPOL Annex II (Phụ lục II Công ước Quốc tế về Phòng chống Ô nhiễm từ Tàu)
   - Phân loại chất lỏng độc hại (NLS - Noxious Liquid Substances) theo MEPC.2-Circ.29 & MEPC.2-Circ.31:
     + Loại X (Category X): Mức độ nguy hại cao nhất cho môi trường biển và sức khỏe. Bắt buộc phải xả rửa trước (Pre-wash) tại cảng dỡ và giao cặn vào trạm tiếp nhận bờ trước khi tàu rời cảng.
     + Loại Y (Category Y): Mức độ nguy hại trung bình. Quy định giới hạn cặn tối đa còn sót lại trong mỗi hầm (<= 75 lít đối với tàu đóng mới).
     + Loại Z (Category Z): Mức độ nguy hại nhỏ. Xả cặn dưới mực nước biển ngoài vùng 12 hải lý.
     + Loại OS (Other Substances): Các chất không gây hại (nước táo, dầu nhờn khoáng nhẹ...).

3. Đặc thù Lớp Sơn Phủ Pure Epoxy của Tàu Dolphin 01
   - Khả năng tương thích: Phù hợp tốt với Dầu thực vật, Dầu mỏ thương phẩm (CPP/DPP), Dầu nhờn, Cồn hữu cơ (Methanol, Ethanol).
   - Giới hạn sống còn:
     + Sơn Epoxy có tính thẩm thấu (Resin Permeability): Sau khi chở dung môi hoạt tính (Benzene, Toluene, Acetone, Methanol), lớp sơn sẽ bị mềm tạm thời. Tuyệt đối không xông hơi quá 80°C và phải để sơn ổn định (Rest period) từ 24 - 48 giờ trước khi chở nước ballast hoặc hàng có tính axit.
     + Không dùng hóa chất tẩy rửa có tính Axit mạnh (Axit Vô cơ như HCl, HNO3 đặc) trực tiếp lên bề mặt sơn vì gây rộp màng sơn Epoxy.

================================================================================
VI. CÔNG THỨC DỰ TOÁN HÓA CHẤT & VẬT TƯ LÀM SẠCH (CHEMICAL CALCULATOR FORMULAS)
================================================================================
1. Khối lượng Nước Tẩy rửa Tuần hoàn (Recirculation Wash Water Volume):
   - V_water = Diện tích bề mặt hầm (m2) x 0.15 đến 0.25 (lít/m2) đối với hệ thống phun máy áp lực cao.
2. Liều lượng Hóa chất Kiềm / Dung môi tẩy rửa (Alkaline / Solvent Cleaner):
   - V_chem = V_water x Nồng độ pha khuyến nghị (từ 1.5% đến 3.0% thể tích).
3. Lượng Dung môi Methanol dùng cho Kiểm tra Wall Wash (WWT Sampling):
   - Trung bình 5 - 10 lít Methanol Lab-grade cho mỗi hầm 1,200 m3 để tráng trắc diện 5 điểm.
`;

fs.writeFileSync(path.join(publicDir, 'rag_context.txt'), masterRagContext, 'utf8');
console.log('Successfully written master RAG context to public/rag_context.txt');
